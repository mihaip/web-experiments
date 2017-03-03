# Opening of "popup" iframes from within an iframe.

Created in March of 2017.

Does not work in sandboxed iframes since they cannot cause navigation of other frames if they are sandboxed. Based on the [Blink source](https://chromium.googlesource.com/chromium/src/+/375b5de438487e3fe5b52014a5962822b59f0d19/third_party/WebKit/Source/core/frame/Frame.cpp#261) that rejects this navigation, it is determined by a "navigation" sandbox directive which is not under the control of user-authored web content.
