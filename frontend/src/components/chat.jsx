import React, { useEffect, useState } from 'react';

const Chat = () => {
    const [isHidden, setIsHidden] = useState(false);

    useEffect(() => {
        (function(d, m){
            var kommunicateSettings = {
                "appId": "337bd17c58dfa89a6c616740ecee8f971",
                "popupWidget": true,
                "automaticChatOpenOnNavigation": true
            };
            var s = document.createElement("script");
            s.type = "text/javascript";
            s.async = true;
            s.src = "https://widget.kommunicate.io/v2/kommunicate.app";
            var h = document.getElementsByTagName("head")[0];
            h.appendChild(s);
            window.kommunicate = m;
            m._globals = kommunicateSettings;
        })(document, window.kommunicate || {});
    }, []);

    useEffect(() => {
        const handleRateLimit = () => {
            console.log('Hiding chatbot due to rate limit');
            setIsHidden(true);
            // Also try to hide the Kommunicate widget directly
            if (window.kommunicate && window.kommunicate.hideWidget) {
                window.kommunicate.hideWidget();
            }
            // Hide any Kommunicate elements that might be on the page
            const kommunicateElements = document.querySelectorAll('[id*="kommunicate"], [class*="kommunicate"], .kommunicate-widget');
            kommunicateElements.forEach(el => {
                el.style.display = 'none';
                el.style.visibility = 'hidden';
            });
        };

        const handleRateLimitEnd = () => {
            console.log('Showing chatbot after rate limit');
            setIsHidden(false);
            // Try to show the Kommunicate widget again
            if (window.kommunicate && window.kommunicate.showWidget) {
                window.kommunicate.showWidget();
            }
            // Show any Kommunicate elements that were hidden
            const kommunicateElements = document.querySelectorAll('[id*="kommunicate"], [class*="kommunicate"], .kommunicate-widget');
            kommunicateElements.forEach(el => {
                el.style.display = '';
                el.style.visibility = '';
            });
        };

        window.addEventListener("rate-limit-hit", handleRateLimit);
        window.addEventListener("rate-limit-end", handleRateLimitEnd);

        return () => {
            window.removeEventListener("rate-limit-hit", handleRateLimit);
            window.removeEventListener("rate-limit-end", handleRateLimitEnd);
        };
    }, []);

    if (isHidden) return null;

    return (
        <div>
            {/* Chat component */}
        </div>
    );
};

export default Chat;
