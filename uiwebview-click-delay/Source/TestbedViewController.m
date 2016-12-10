#import "TestbedViewController.h"
#import <WebKit/WebKit.h>

static UILabel *makeHeader(NSString *text, CGFloat *top) {
    UILabel *label = [[UILabel alloc] initWithFrame:CGRectMake(10, *top, 0, 0)];
    label.text = text;
    label.font = [UIFont preferredFontForTextStyle:UIFontTextStyleTitle1];
    [label sizeToFit];
    *top += label.bounds.size.height + 10;
    return label;
}

static void sizeWebView(UIView *webView, CGFloat *top) {
    webView.frame = CGRectMake(10, *top, UIScreen.mainScreen.bounds.size.width - 20, 70);
    webView.autoresizingMask = UIViewAutoresizingFlexibleWidth;
    *top += webView.bounds.size.height + 20;
}

@implementation TestbedViewController

-(void)loadView {
    [super loadView];

    NSString *testbedPath = [NSBundle.mainBundle pathForResource:@"testbed" ofType:@"html"];
    NSURL *testbedUrl = [NSURL fileURLWithPath:testbedPath];

    self.view = [[UIView alloc] initWithFrame:UIScreen.mainScreen.bounds];
    CGFloat top = 20;

    [self.view addSubview:makeHeader(@"Regular UIWebView", &top)];
    UIWebView *regularUiWebView = [[UIWebView alloc] initWithFrame:CGRectZero];
    sizeWebView(regularUiWebView, &top);
    [self.view addSubview:regularUiWebView];
    [regularUiWebView loadRequest:[NSURLRequest requestWithURL:testbedUrl]];

    [self.view addSubview:makeHeader(@"WKWebView", &top)];
    WKWebView *wkWebView = [[WKWebView alloc] initWithFrame:CGRectZero];
    sizeWebView(wkWebView, &top);
    [self.view addSubview:wkWebView];
    [wkWebView loadRequest:[NSURLRequest requestWithURL:testbedUrl]];

    [self.view addSubview:makeHeader(@"Hacked UIWebView", &top)];
    UIWebView *hackedUiWebView = [[UIWebView alloc] initWithFrame:CGRectZero];
    sizeWebView(hackedUiWebView, &top);
    [self dumpGestureRecognizers:hackedUiWebView level:0];
    [self disableDoubleTapGestureRecognizer:hackedUiWebView];
    [self.view addSubview:hackedUiWebView];
    [hackedUiWebView loadRequest:[NSURLRequest requestWithURL:testbedUrl]];
}

-(void)dumpGestureRecognizers:(UIView *)view level:(int)level {
    NSMutableString *prefix = [NSMutableString new];
    for (int i = 0; i < level; i++) {
        [prefix appendString:@"  "];
    }
    NSLog(@"%@ view: %@", prefix, view);
    if (view.gestureRecognizers.count) {
        NSLog(@"%@ gestureRecognizers", prefix);
        for (UIGestureRecognizer *gestureRecognizer in view.gestureRecognizers) {
            NSLog(@"%@   %@", prefix, gestureRecognizer);
        }
    }
    for (UIView *subview in view.subviews) {
        [self dumpGestureRecognizers:subview level:level + 1];
    }
}

-(void)disableDoubleTapGestureRecognizer:(UIWebView *)webView {
    for (UIView* view in webView.scrollView.subviews) {
        if ([view.class.description hasPrefix:@"UIWeb"] && [view.class.description hasSuffix:@"BrowserView"]) {
            for (UIGestureRecognizer *gestureRecognizer in view.gestureRecognizers) {
                if ([gestureRecognizer isKindOfClass:UITapGestureRecognizer.class]) {
                    UITapGestureRecognizer *tapRecognizer = (UITapGestureRecognizer *) gestureRecognizer;
                    if (tapRecognizer.numberOfTapsRequired == 2 && tapRecognizer.numberOfTouchesRequired == 1) {
                        tapRecognizer.enabled = NO;
                    }
                }
            }
            break;
        }
    }
}


@end
