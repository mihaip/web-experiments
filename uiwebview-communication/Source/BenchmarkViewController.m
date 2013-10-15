#import "BenchmarkViewController.h"

#import <mach/mach_time.h>

enum Mechanism {
    LocationHref = 0,
    LinkClick,
    FrameLocationHref,
    FrameSrc,
    FrameLinkClick,
    CookieChange,
    kNumMechanisms
};

const NSUInteger kNumIterationsPerMechanisms = 1000;
const NSUInteger kNumIterations = kNumIterationsPerMechanisms * kNumMechanisms;

typedef struct {
    uint64_t min;
    uint64_t max;
    uint64_t sum;
} MechanismTiming;

@implementation BenchmarkViewController {
    UIWebView *_webView;
    UIButton *_benchmarkButton;
    NSUInteger _iterationCounter;
    UITextView *_results;
    MechanismTiming _mechanismTimings[kNumMechanisms];
}

-(void)loadView {
    [super loadView];
    self.view = [[UIView alloc] initWithFrame:UIScreen.mainScreen.bounds];

    CGFloat width = self.view.bounds.size.width;

    _benchmarkButton = [UIButton buttonWithType:UIButtonTypeSystem];
    [_benchmarkButton setTitle:@"Benchmark" forState:UIControlStateNormal];
    [_benchmarkButton setTitle:@"Running…" forState:UIControlStateDisabled];
    [_benchmarkButton sizeToFit];
    _benchmarkButton.center = CGPointMake(width/2, 50);
    [_benchmarkButton addTarget:self action:@selector(runBenchmark:) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:_benchmarkButton];

    _webView = [[UIWebView alloc] initWithFrame:CGRectMake(15, CGRectGetMaxY(_benchmarkButton.frame) + 10, width - 30, 56)];
    _webView.delegate = self;
    [self.view addSubview:_webView];

    _results = [[UITextView alloc] initWithFrame:CGRectMake(15, CGRectGetMaxY(_webView.frame) + 10, width - 30, self.view.bounds.size.height - CGRectGetMaxY(_webView.frame) - 10) textContainer:nil];
    _results.font = [UIFont fontWithName:@"Courier" size:12];
    _results.editable = NO;
    [self.view addSubview:_results];

    [NSNotificationCenter.defaultCenter addObserverForName:NSHTTPCookieManagerCookiesChangedNotification
                                                    object:nil
                                                     queue:nil
                                                usingBlock:^(NSNotification *notification) {
                                                    NSHTTPCookieStorage *cookieStorage = notification.object;
                                                    NSHTTPCookie *pongCookie = nil;
                                                    for (NSHTTPCookie *cookie in cookieStorage.cookies) {
                                                        if ([cookie.name isEqualToString:@"pong"]) {
                                                            pongCookie = cookie;
                                                            break;
                                                        }
                                                    }
                                                    if (!pongCookie) {
                                                        return;
                                                    }
                                                    uint64_t start = pongCookie.value.longLongValue;
                                                    uint64_t end = mach_absolute_time();
                                                    [self endIteration:end - start];
    }];
}

-(void)viewDidLoad {
    [super viewDidLoad];

    NSString *benchmarkPath = [NSBundle.mainBundle pathForResource:@"benchmark" ofType:@"html"];
    NSURL *benchmarkUrl = [NSURL fileURLWithPath:benchmarkPath];
    [_webView loadRequest:[NSURLRequest requestWithURL:benchmarkUrl]];
}

-(void)runBenchmark:(UIButton *)button {
    _benchmarkButton.enabled = NO;
    _iterationCounter = 0;
    for (size_t i = 0; i < kNumMechanisms; i++) {
        _mechanismTimings[i].max = 0;
        _mechanismTimings[i].min = ULLONG_MAX;
        _mechanismTimings[i].sum = 0;
    }
    [self performSelector:@selector(startIteration) withObject:nil afterDelay:0];
}

-(void)startIteration {
    int mechanism = _iterationCounter % kNumMechanisms;
    uint64_t start = mach_absolute_time();
    [_webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"ping(%d, '%qu')", mechanism, start]];
}

-(void)endIteration:(uint64_t)delta {
    int mechanism = _iterationCounter % kNumMechanisms;
    MechanismTiming *timing = &_mechanismTimings[mechanism];
    if (timing->min > delta) {
        timing->min = delta;
    }
    if (timing->max < delta) {
        timing->max = delta;
    }
    timing->sum += delta;
    _iterationCounter++;
    if (_iterationCounter == kNumIterations) {
        [self showBenchmarkResults];
    } else {
        // Run the next iteration in the next spin of the event loop to avoid nested UIWebViewDelegate method invocations
        // for mechanisms that run synchronously.
        [self performSelector:@selector(startIteration) withObject:nil afterDelay:0];
    }
}

-(void)showBenchmarkResults {
    _benchmarkButton.enabled = YES;
    NSMutableString *results = [[NSMutableString alloc] initWithString:_results.text];
    if ([results length] == 0) {
        [results appendString:@"Method            Avg.   Min.   Max\n"];
    } else {
        [results appendString:@"\n"];
    }
    for (size_t i = 0; i < kNumMechanisms; i++) {
        NSString *name = @"";
        switch (i) {
            case LocationHref:      name = @"location.href   "; break;
            case LinkClick:         name = @"<a> click       "; break;
            case FrameLocationHref: name = @"frame location  "; break;
            case FrameSrc:          name = @"frame src       "; break;
            case FrameLinkClick:    name = @"frame <a> click "; break;
            case CookieChange:      name = @"document.cookie "; break;
        }
        MechanismTiming *timing = &_mechanismTimings[i];
        double averageMs = [self machTimeToMs:timing->sum]/(double)kNumIterationsPerMechanisms;
        double minMs = [self machTimeToMs:timing->min];
        double maxMs = [self machTimeToMs:timing->max];
        [results appendString:[NSString stringWithFormat:@"%@  %4.3f  %4.3f  %4.3f\n", name, averageMs, minMs, maxMs]];
    }
    _results.text = results;
}

-(double)machTimeToMs:(uint64_t)machTime {
    mach_timebase_info_data_t timebase;
    mach_timebase_info(&timebase);
    return (double)(machTime) * (double)timebase.numer / (double)timebase.denom / 1e6;
}

-(BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType {
    if ([request.URL.scheme isEqualToString:@"pong"]) {
        uint64_t start = request.URL.host.longLongValue;
        uint64_t end = mach_absolute_time();
        [self endIteration:end - start];
        return NO;
    }
    return YES;
}

@end
