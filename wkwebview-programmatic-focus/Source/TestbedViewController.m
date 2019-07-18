#import "TestbedViewController.h"
#import <WebKit/WebKit.h>

// Subset of methods from https://trac.webkit.org/browser/webkit/trunk/Source/WebKit/UIProcess/API/Cocoa/_WKInputDelegate.h that we use
@protocol WKWebViewInputDelegate

-(BOOL)_webView:(WKWebView *)webView focusShouldStartInputSession:(id)info;

@end

// Subset of methods from https://trac.webkit.org/browser/webkit/trunk/Source/WebKit/UIProcess/API/Cocoa/WKWebViewPrivate.h that we use
@interface WKWebView (WKWebViewPrivate)

-(void)_setInputDelegate:(id<WKWebViewInputDelegate>)delegate;
-(id<WKWebViewInputDelegate>)_inputDelegate;

@end

@interface TestbedViewController () <WKWebViewInputDelegate>

@end


static UILabel *makeHeader(NSString *text, CGFloat *top) {
    UILabel *label = [[UILabel alloc] initWithFrame:CGRectMake(10, *top, 0, 0)];
    label.text = text;
    label.font = [UIFont preferredFontForTextStyle:UIFontTextStyleTitle2];
    [label sizeToFit];
    *top += label.bounds.size.height + 8;
    return label;
}

static void sizeWebView(UIView *webView, CGFloat *top) {
    webView.frame = CGRectMake(10, *top, UIScreen.mainScreen.bounds.size.width - 20, 70);
    webView.autoresizingMask = UIViewAutoresizingFlexibleWidth;
    *top += webView.bounds.size.height + 16;
}

@implementation TestbedViewController

-(void)loadView {
    [super loadView];

    NSString *testbedPath = [NSBundle.mainBundle pathForResource:@"testbed" ofType:@"html"];
    NSURL *testbedUrl = [NSURL fileURLWithPath:testbedPath];

    self.view = [[UIView alloc] initWithFrame:UIScreen.mainScreen.bounds];
    CGFloat top = 20;

    [self.view addSubview:makeHeader(@"UIWebView", &top)];
    UIWebView *uiWebView = [[UIWebView alloc] initWithFrame:CGRectZero];
    uiWebView.keyboardDisplayRequiresUserAction = NO;
    sizeWebView(uiWebView, &top);
    [self.view addSubview:uiWebView];
    [uiWebView loadRequest:[NSURLRequest requestWithURL:testbedUrl]];

    [self.view addSubview:makeHeader(@"WKWebView", &top)];
    WKWebView *regularWkWebView = [[WKWebView alloc] initWithFrame:CGRectZero];
    sizeWebView(regularWkWebView, &top);
    [self.view addSubview:regularWkWebView];
    [regularWkWebView loadRequest:[NSURLRequest requestWithURL:testbedUrl]];

    [self.view addSubview:makeHeader(@"Hacked WKWebView", &top)];
    WKWebView *hackedWkWebView = [[WKWebView alloc] initWithFrame:CGRectZero];
    sizeWebView(hackedWkWebView, &top);
    [self configureWkWebViewInputDelegate:hackedWkWebView];
    [self.view addSubview:hackedWkWebView];
    [hackedWkWebView loadRequest:[NSURLRequest requestWithURL:testbedUrl]];
}

-(void)configureWkWebViewInputDelegate:(WKWebView *)webView {
    // Allow the JS side to bring up the keyboard even without any user interaction.
    // We rely on the (private) input delegate being able to override the default.
    // See the delegate checks in _elementDidFocus:userIsInteracting:blurPreviousNode:activityStateChanges:userObject: from
    // https://trac.webkit.org/browser/webkit/trunk/Source/WebKit/UIProcess/ios/WKContentViewInteraction.mm
    if ([webView respondsToSelector:@selector(_inputDelegate)]) {
        id<WKWebViewInputDelegate> existingInputDelegate = [webView _inputDelegate];
        if (existingInputDelegate) {
            NSLog(@"WKWebView already had an input delegate: %@ (will override it)", existingInputDelegate);
        }
    }
    if ([webView respondsToSelector:@selector(_setInputDelegate:)]) {
        [webView _setInputDelegate:self];
    } else {
        NSLog(@"WKWebView no longer responds to _setInputDelegate, programatic focus will not work");
    }
}

#pragma mark WKWebViewInputDelegate implementation

-(BOOL)_webView:(WKWebView *)webView focusShouldStartInputSession:(id)info {
    return YES;
}

@end
