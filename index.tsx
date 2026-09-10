import { BackHandler, Linking, StyleSheet, View } from 'react-native';
import React, { createRef, useCallback, useEffect, useState } from 'react';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { EventType, webviewSource, popupHtml, LOG } from './scripts';

type Props = {
    helloConfig: { [key in string]: any }
    projectId: string
}
type MSG91PushNotificationSDKProps = React.FC<Props> & {
    registerFCM: (fcmToken: string) => void
    handleFCMNotification: (htmlContentUrl: string) => void
}

let _registerFCM: any = null;
let _getHtmlBodyFromUrl: any = null;

const buildHelloConfig = (config: { [key in string]: any }, projectId?: string, accessToken?: string) => {
    const nextConfig = { ...config };

    Object.keys(nextConfig).forEach(key => {
        if (!!!nextConfig[key]) {
            delete nextConfig[key];
        }
    });

    // In-app popups need project_id on init. access_token is only for FCM.
    if (projectId) {
        nextConfig.pushConfig = {
            project_id: projectId,
            access_token: accessToken || undefined,
        };
    }

    return nextConfig;
};

const MSG91PushNotificationSDK: MSG91PushNotificationSDKProps = ({ helloConfig, projectId }) => {
    const popupWebviewRef = createRef<WebView>();
    const [helloConfigState, setHelloConfigState] = useState(() => buildHelloConfig(helloConfig, projectId));
    const [popupWebviewState, setPopupWebviewState] = useState({ htmlContent: '', mounted: false, visible: false });
    const [reloadWebviewWithKey, setReloadWebviewWithKey] = useState('webview-key-1');

    useEffect(() => {
        setHelloConfigState(prevHelloConfigState =>
            buildHelloConfig(helloConfig, projectId, prevHelloConfigState?.pushConfig?.access_token)
        );
    }, [helloConfig, projectId])

    useEffect(() => {
        LOG('Reloading Webview', helloConfigState);
        setReloadWebviewWithKey(prev => prev + 1)
    }, [helloConfigState])


    const handleHtmlData = (htmlContent: string | undefined | null) => {
        if (!!htmlContent) {
            setPopupWebviewState(prev => ({ ...prev, htmlContent: htmlContent, mounted: true }));
            popupWebviewRef?.current?.reload()
            const timeout = setTimeout(() => {
                setPopupWebviewState(prev => ({ ...prev, visible: true }));
                clearTimeout(timeout);
            }, 1000);
        }

    }

    const handleEvents = useCallback((data: any) => {
        LOG('[handleEvents]:', data?.type)
        switch (data?.type) {
            case EventType.HIDE_POPUP:
                setPopupWebviewState({ htmlContent: '', mounted: false, visible: false });
                break;
            case EventType.OPEN_URL:
                if (data?.url) Linking.openURL(data.url);
                break;
            case EventType.RELOAD:
                LOG('Reloading Webview from event');
                setReloadWebviewWithKey(prev => prev + 1)
                break;
            // Handle FCM Notification event
            case EventType.HTML_CONTENT:
                handleHtmlData(data?.htmlContent)
                break;
            // Handle socket Push Notification event
            case EventType.PUSH_NOTIFICATION:
                handleHtmlData(data?.data?.content)
                break;
            default:
                return;
        }
    }, [])

    const onMessage = useCallback((event: WebViewMessageEvent) => {
        LOG('[Native Event]:', event?.nativeEvent?.data)

        const data = JSON.parse(event?.nativeEvent?.data);
        if (data?.type) {
            handleEvents(data);
        }
    }, [])

    _registerFCM = (fcm: string) => {
        if (!projectId) {
            return;
        }
        setHelloConfigState((prevHelloConfigState) =>
            buildHelloConfig(prevHelloConfigState, projectId, fcm || undefined)
        );
    };

    _getHtmlBodyFromUrl = useCallback(async (url: string) => {
        try {
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                handleHtmlData(data?.html_content);
            }
        } catch (error) {
        }
    }, [])

    useEffect(() => {
        let subscribe = null;
        if (popupWebviewState.visible) {
            subscribe = BackHandler.addEventListener("hardwareBackPress", () => {
                setPopupWebviewState({ htmlContent: '', mounted: false, visible: false });
                return true;
            });
        }
        return () => {
            subscribe?.remove()
        }
    }, [popupWebviewState.visible]);

    return (
        <>
            <View style={styles.socketWebviewStyle}>
                <WebView
                    key={reloadWebviewWithKey}
                    source={webviewSource(helloConfigState)}
                    webviewDebuggingEnabled={true}
                    style={{ backgroundColor: 'red' }}
                    onMessage={onMessage}
                />
            </View>
            { popupWebviewState.mounted &&
                <View
                    style={{
                        display: popupWebviewState.visible ? 'flex' : 'none',
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        bottom: popupWebviewState.visible ? 0 : undefined,
                        left: popupWebviewState.visible ? 0 : undefined
                    }}
                >
                    <WebView
                        ref={popupWebviewRef}
                        source={{ html: popupHtml(popupWebviewState?.htmlContent) }}
                        onMessage={onMessage}
                        containerStyle={styles.webviewContainerStyle}
                        style={styles.webviewStyle}
                        scalesPageToFit={false}
                        scrollEnabled={false}
                        bounces={false}
                        overScrollMode='never'
                        onShouldStartLoadWithRequest={(request) => {
                            if (request.url !== "https://control.msg91.com/app/assets/dummy-page/index.html") {
                                Linking.openURL(request.url)
                                return false
                            }
                            return true
                        }}
                    />
                </View>
            }
        </>
    )
}

export default MSG91PushNotificationSDK

const styles = StyleSheet.create({
    webviewContainerStyle: {
        flex: 1,
        backgroundColor: 'transparent',
        
    },
    webviewStyle: {
        // backgroundColor: '#00000060'
        backgroundColor: 'transparent'
    },
    socketWebviewStyle: {
        // backgroundColor: 'transparent',
        display: 'none',
        // position: 'absolute',
        // top: 0,
        // right: 0,
        // bottom: 0,
        // left: 0,
        // backgroundColor: 'red'
    }
})

MSG91PushNotificationSDK.handleFCMNotification = (htmlContentUrl) => {
    _getHtmlBodyFromUrl(htmlContentUrl);
}
MSG91PushNotificationSDK.registerFCM = (fcmToken) => {
    _registerFCM(fcmToken);
}