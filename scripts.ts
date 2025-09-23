const Urls = {
    PROD: 'https://blacksea.msg91.com/chat-widget.js'
}

const isDebug = false;

export const LOG = (...args: any[]) => {
    if (isDebug) {
        console.log('[MSG91 PUSH NOTIFICATION]:', ...args)
    }
};

const EventType = {
    HIDE_POPUP: 'HIDE_POPUP',
    OPEN_URL: 'OPEN_URL',
    HTML_CONTENT: 'HTML_CONTENT',
    PUSH_NOTIFICATION: 'PUSH_NOTIFICATION',
    RELOAD: 'RELOAD'
}

const webviewSource = (helloConfig: any) => {
    LOG('webviewSource', helloConfig)
    return {
        html: `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
                <title>Hello Chat Widget SDK</title>
                <style>
                    body {
                        margin: 0;
                        padding: 0;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        background-color: #f8f9fa;
                        height: 100vh;
                        display: flex;
                        flex-direction: column;
                    }
                      
                    /* Close Button */
                    .close-button {
                        position: absolute;
                        top: 16px;
                        right: 16px;
                        width: 32px;
                        height: 32px;
                        background-color: rgba(0, 0, 0, 0.1);
                        border: none;
                        border-radius: 50%;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 18px;
                        color: #666;
                        z-index: 1;
                        transition: all 0.2s ease;
                    }
                    
                    .close-button:hover {
                        background-color: rgba(0, 0, 0, 0.2);
                        color: #333;
                        transform: scale(1.1);
                    }
                    
                    .close-button::before {
                        content: '×';
                        font-weight: bold;
                        line-height: 1;
                    }
                    
                    /* Loader Container */
                    .loader-container {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                    }

                    .loader-container.hidden {
                        opacity: 0;
                        pointer-events: none;
                    }
                      
                    /* Three Dots Loader */
                    .spinner {
                        display: flex;
                        gap: 8px;
                        margin-bottom: 16px;
                    }
                    
                    .spinner div {
                        width: 12px;
                        height: 12px;
                        background-color: #007bff;
                        border-radius: 50%;
                        animation: bounce 1.4s ease-in-out infinite both;
                    }
                    
                    .spinner div:nth-child(1) { animation-delay: -0.32s; }
                    .spinner div:nth-child(2) { animation-delay: -0.16s; }
                    
                    @keyframes bounce {
                        0%, 80%, 100% { transform: scale(0); }
                        40% { transform: scale(1); }
                    }
                      
                    /* Text Styles */
                    
                    .loader-text {
                        color: #000000;
                        font-size: 16px;
                        text-align: center;
                    }
                    
                    .error-message {
                        color: #000000;
                        font-size: 14px;
                        text-align: center;
                        padding: 16px;
                        display: none;
                    }
                    
                    .reload-button {
                        background-color: #007bff;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 6px;
                        font-size: 14px;
                        cursor: pointer;
                        margin-top: 16px;
                        transition: background-color 0.2s ease;
                        display: none;
                    }
                    
                    .reload-button:hover {
                        background-color: #0056b3;
                    }
                    
                    .reload-button:active {
                        transform: translateY(1px);
                    }  
                </style>
                <script type="text/javascript">
                    var helloConfig = ${JSON.stringify({
                        ...helloConfig,
                        isMobileSDK: true,
                    })};
                                
                    function hideLoader() {
                        const loader = document.getElementById('loader');
                        if (loader) {
                            loader.classList.add('hidden');
                            setTimeout(() => {
                                loader.style.display = 'none';
                            }, 300);
                        }
                    }
                    
                    function showError() {
                        const loader = document.getElementById('loader');
                        const spinner = document.querySelector('.spinner');
                        const loaderText = document.querySelector('.loader-text');
                        const errorMessage = document.querySelector('.error-message');
                        const reloadButton = document.querySelector('.reload-button');
                        
                        if (spinner) spinner.style.display = 'none';
                        if (loaderText) loaderText.style.display = 'none';
                        if (errorMessage) {
                            errorMessage.style.display = 'block';
                            errorMessage.textContent = 'Failed to load chat. Please check your connection and try again.';
                        }
                        if (reloadButton) {
                            reloadButton.style.display = 'inline-block';
                        }
                    }
                    
                    function reloadPage() {
                        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'RELOAD' }));
                    }
                    
                    
                    window.addEventListener("message", (event) => {
                        LOG("[PUSH_NOTIFICATION]", event)
                        if (event?.data?.type === '${EventType.PUSH_NOTIFICATION}') {
                            window.ReactNativeWebView.postMessage(JSON.stringify(event.data))
                        }
                    })

                    // Script load handlers
                    function handleScriptLoad() {
                        try {
                            initChatWidget(helloConfig, 0);
                        } catch (error) {
                            LOG('Error initializing chat widget:', error);
                            handleScriptError();
                        }
                    }
                    
                    function handleScriptError() {
                        reloadPage();
                        showError();
                    }

                    function LOG(...args) { console.log('[MSG91 HELLO SDK]:', ...args) }
                </script>
            </head>
            <body onload="hideLoader()">
                
                <!-- Loader -->
                <div id="loader" class="loader-container">
                    <div class="spinner">
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                    <div class="loader-text">Loading chat...</div>
                    <div class="error-message"></div>
                    <button class="reload-button" onclick="reloadPage()">Try Again</button>
                </div>

                <script 
                    type="text/javascript" 
                    src="${Urls.PROD}"
                    onload="handleScriptLoad()"
                    onerror="handleScriptError()">
                </script>

            </body>
        </html>
    `,
}}

const popupHtml = (htmlContent: string) => {
    return (`
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">
                <title>Popup WebView - Hello Push Notifications</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                        user-select: none;
                        -webkit-tap-highlight-color: transparent;
                    }

                    .webview-popup-body {
                        margin: 0;
                        min-height: 100vh;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        font-family: Arial, sans-serif;
                        background-color: rgba(0, 0, 0, 0.5);
                    }

                    .popup-container {
                        position: relative;
                        background: white;
                        padding: 4px;
                        border-radius: 12px;
                        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
                        // min-width: 80vw;
                        max-width: 90vw;
                        min-height: 20vh;
                        max-height: 90vh;
                        display: flex;
                        flex-direction: column;
                    }

                    .close-button {
                        position: absolute;
                        top: -12px;
                        right: -12px;
                        width: 28px;
                        height: 28px;
                        background: #4a5568;
                        border: 2px solid white;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
                        z-index: 2;
                    }

                    .close-button::before,
                    .close-button::after {
                        content: '';
                        position: absolute;
                        width: 14px;
                        height: 2px;
                        background: white;
                    }

                    .close-button::before {
                        transform: rotate(45deg);
                    }

                    .close-button::after {
                        transform: rotate(-45deg);
                    }

                    #popup-content {
                        overflow-y: auto;
                        -webkit-overflow-scrolling: touch;
                        border-radius: 8px;
                        // max-height: calc(80vh - 40px); /* Account for padding */
                        // padding-right: 10px; /* Space for scrollbar */
                    }

                    /* Styling for the scrollbar */
                    #popup-content::-webkit-scrollbar {
                        // width: 6px;
                    }

                    #popup-content::-webkit-scrollbar-track {
                        background: #f1f1f1;
                        border-radius: 3px;
                    }

                    #popup-content::-webkit-scrollbar-thumb {
                        background: #888;
                        border-radius: 3px;
                    }

                    /* Ensure images don't overflow */
                    #popup-content img {
                        // max-width: 100%;
                        height: auto;
                    }

                    /* Handle tables */
                    #popup-content table {
                        // max-width: 100%;
                        display: block;
                        // overflow-x: auto;
                    }
                </style>
            </head>
            <body class="webview-popup-body">
                <div class="popup-container">
                    <div class="close-button" onclick="window.ReactNativeWebView.postMessage(JSON.stringify({ 'type': '${EventType.HIDE_POPUP}' }))"></div>
                    <div id="popup-content">
                        ${htmlContent}
                    </div>
                </div>

                <script>
                    // Adjust container height based on content
                    document.addEventListener('DOMContentLoaded', function() {
                        const content = document.getElementById('popup-content');
                        const container = document.querySelector('.popup-container');
                        
                        // If content is smaller than max-height, adjust container
                        if (content.scrollHeight < content.clientHeight) {
                            content.style.height = 'auto';
                            container.style.height = 'auto';
                        }

                        // Handle links to open in system browser
                        content.addEventListener('click', function(e) {
                            if (e.target.tagName === 'A') {
                                e.preventDefault();
                                window.ReactNativeWebView.postMessage(JSON.stringify({
                                    'type': 'OPEN_URL',
                                    'url': e.target.href
                                }));
                            }
                        });
                    });
                </script>
            </body>
        </html>
    `)
}

export { EventType, webviewSource, popupHtml }