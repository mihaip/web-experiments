#import "AppDelegate.h"
#import "BenchmarkViewController.h"

@implementation AppDelegate

-(BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    self.window = [[UIWindow alloc] initWithFrame:UIScreen.mainScreen.bounds];
    self.window.backgroundColor = [UIColor whiteColor];
    self.window.rootViewController = [BenchmarkViewController new];
    [self.window makeKeyAndVisible];
    return YES;
}


@end
