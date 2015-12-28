//
//  AppDelegate.m
//  React Multiple Windows
//
//  Created by Mihai Parparita on 12/27/15.
//  Copyright © 2015 persistent.info. All rights reserved.
//

#import <WebKit/WebKit.h>
#import "AppDelegate.h"

@interface PopoverViewController : NSViewController

-(instancetype)initWithWebView:(WebView *)webView;
-(void)show;

@property (nonatomic) NSPopover *popover;
@property (nonatomic, weak) NSView *positioningView;
@property (nonatomic) NSRect positioningRect;

@end


@interface AppDelegate () <WebUIDelegate>

@property (weak) IBOutlet NSWindow *window;
@property (weak) IBOutlet WebView *webView;
@property (nonatomic) NSMutableArray<PopoverViewController *> *popoverControllers;

@end

@implementation AppDelegate

-(instancetype)init {
    if (self = [super init]) {
        _popoverControllers = [NSMutableArray new];
    }
    return self;
}

-(void)applicationDidFinishLaunching:(NSNotification *)aNotification {
    self.webView.UIDelegate = self;

    NSString *indexPath = [NSBundle.mainBundle pathForResource:@"web/index" ofType:@"html"];
    NSURL *indexUrl = [NSURL fileURLWithPath:indexPath];
    [self.webView.mainFrame loadRequest:[NSURLRequest requestWithURL:indexUrl]];
}

-(WebView *)webView:(WebView *)sender createWebViewWithRequest:(NSURLRequest *)request {
    WebView *webView = [WebView new];
    webView.drawsBackground = NO;
    PopoverViewController *popoverController = [[PopoverViewController alloc] initWithWebView:webView];
    popoverController.positioningRect = CGRectMake(0, sender.bounds.size.height - 90 * (self.popoverControllers.count + 1), sender.bounds.size.width, 90);
    popoverController.positioningView = sender;
    [popoverController performSelector:@selector(show) withObject:nil afterDelay:0];
    [self.popoverControllers addObject:popoverController];
    return webView;
}

@end

@implementation PopoverViewController

-(instancetype)initWithWebView:(WebView *)webView {
    if (self = [super init]) {
        _popover = [NSPopover new];
        _popover.animates = YES;
        _popover.behavior = NSPopoverBehaviorApplicationDefined;
        _popover.contentSize = CGSizeMake(220, 60);
        _popover.contentViewController = self;
        _popover.animates = NO;

        self.view = webView;
        webView.frame = CGRectMake(0, 0, _popover.contentSize.width, _popover.contentSize.height);
        webView.autoresizingMask = NSViewWidthSizable | NSViewHeightSizable;
    }
    return self;
}

-(void)show {
    [_popover showRelativeToRect:self.positioningRect ofView:self.positioningView preferredEdge:NSMaxXEdge];
}

@end