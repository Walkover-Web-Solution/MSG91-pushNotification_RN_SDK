import { BackHandler, Linking, Modal, StyleSheet, View, Platform } from 'react-native';
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

const MSG91PushNotificationSDK: MSG91PushNotificationSDKProps = ({ helloConfig, projectId }) => {
    const popupWebviewRef = createRef<WebView>();
    const [helloConfigState, setHelloConfigState] = useState(helloConfig);
    const [popupWebviewState, setPopupWebviewState] = useState({ htmlContent: '', mounted: false, visible: false });
    const [reloadWebviewWithKey, setReloadWebviewWithKey] = useState('webview-key-1');

    useEffect(() => {
        let _helloConfig = { ...helloConfig };
        let isKeyWithEmptyValuePresent = false;

        Object.keys(_helloConfig).forEach(key => {
            if (!!!_helloConfig[key]) {
                isKeyWithEmptyValuePresent = true;
                delete _helloConfig[key];
            }
        });
        if (isKeyWithEmptyValuePresent) {
            setHelloConfigState(_helloConfig);
        }
    }, [helloConfig])

    useEffect(() => {
        LOG('Reloading Webview', helloConfigState);
        setReloadWebviewWithKey(prev => prev + 1)
    }, [helloConfigState])


    const handleHtmlData = (htmlContent: string | undefined | null) => {
        if (!!htmlContent) {
            setPopupWebviewState({ htmlContent, mounted: true, visible: true });
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
            case EventType.HTML_CONTENT:
                handleHtmlData(data?.htmlContent)
                break;
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
        if (!!fcm && projectId) {
            setHelloConfigState((prevHelloConfigState) => {
                return {
                    ...prevHelloConfigState,
                    pushConfig: {
                        project_id: projectId,
                        access_token: fcm,
                        ...(Platform.OS === 'ios' && { device_type: 'ios' })

                   }
                }
            })
        }
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
            <View style={styles.socketWebviewStyle} pointerEvents="none" collapsable={false}>
                <WebView
                    key={reloadWebviewWithKey}
                    source={webviewSource(helloConfigState)}
                    style={styles.hiddenWebview}
                    onMessage={onMessage}
                    collapsable={false}
                />
            </View>
            <Modal
                visible={popupWebviewState.mounted && popupWebviewState.visible}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => setPopupWebviewState({ htmlContent: '', mounted: false, visible: false })}
                pointerEvents="box-none"
            >
                <View style={styles.modalRoot} pointerEvents="box-none">
                    {popupWebviewState.mounted && (
                        <View style={styles.popupOverlay} pointerEvents="auto">
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
                                    const isInternalLoad =
                                        !request.url ||
                                        request.url === 'about:blank' ||
                                        request.url.startsWith('about:') ||
                                        request.url.startsWith('data:') ||
                                        request.url.includes('/app/assets/dummy-page/');

                                    if (isInternalLoad) return true;

                                    if (request.navigationType === 'click') {
                                        Linking.openURL(request.url);
                                        return false;
                                    }
                                    return true;
                                }}
                            />
                        </View>
                    )}
                </View>
            </Modal>
        </>
    )
}

export default MSG91PushNotificationSDK

const styles = StyleSheet.create({
    modalRoot: {
        flex: 1,
    },
    popupOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 99999,
        elevation: 99999,
        backgroundColor: 'transparent',
    },
    webviewContainerStyle: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    webviewStyle: {
        backgroundColor: 'transparent'
    },
    hiddenWebview: {
        width: 1,
        height: 1,
        opacity: 0,
    },
    socketWebviewStyle: {
        position: 'absolute',
        width: 1,
        height: 1,
        opacity: 0,
        zIndex: -1,
    },
})

MSG91PushNotificationSDK.handleFCMNotification = (htmlContentUrl) => {
    _getHtmlBodyFromUrl(htmlContentUrl);
}
MSG91PushNotificationSDK.registerFCM = (fcmToken) => {
    _registerFCM(fcmToken);
}
