import UIKit
import WebKit

final class ViewController: UIViewController, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler {
    private var webView: WKWebView!

    override func loadView() {
        let contentController = WKUserContentController()
        contentController.add(self, name: "chutaShare")

        // Compatibilidade com a ponte Android já utilizada pela WebApp.
        let bridgeScript = WKUserScript(
            source: """
            window.ChutaAndroid = window.ChutaAndroid || {};
            window.ChutaAndroid.shareWhatsApp = function(text) {
                window.webkit.messageHandlers.chutaShare.postMessage(String(text || ''));
            };
            """,
            injectionTime: .atDocumentStart,
            forMainFrameOnly: false
        )
        contentController.addUserScript(bridgeScript)

        let config = WKWebViewConfiguration()
        config.userContentController = contentController
        config.websiteDataStore = .default()
        config.defaultWebpagePreferences.allowsContentJavaScript = true
        config.allowsInlineMediaPlayback = true

        webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.backgroundColor = .black
        webView.isOpaque = true
        view = webView
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        loadLocalApp()
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(appDidBecomeActive),
            name: .chutaDidBecomeActive,
            object: nil
        )
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
        webView?.configuration.userContentController.removeScriptMessageHandler(forName: "chutaShare")
    }

    private func loadLocalApp() {
        guard let htmlURL = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "Resources") else {
            showLoadError("Não foi possível encontrar index.html no bundle.")
            return
        }
        let resourcesURL = htmlURL.deletingLastPathComponent()
        webView.loadFileURL(htmlURL, allowingReadAccessTo: resourcesURL)
    }

    @objc private func appDidBecomeActive() {
        // A WebApp já verifica o reset semanal e a sincronização ao voltar a primeiro plano.
        webView.evaluateJavaScript("document.dispatchEvent(new Event('visibilitychange')); window.dispatchEvent(new Event('focus'));", completionHandler: nil)
    }

    private func showLoadError(_ message: String) {
        let label = UILabel(frame: UIScreen.main.bounds)
        label.text = message
        label.textColor = .white
        label.backgroundColor = .black
        label.numberOfLines = 0
        label.textAlignment = .center
        view = label
    }

    // MARK: - JavaScript bridge

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "chutaShare" else { return }
        shareText(String(describing: message.body))
    }

    private func shareText(_ text: String) {
        let activity = UIActivityViewController(activityItems: [text], applicationActivities: nil)
        if let popover = activity.popoverPresentationController {
            popover.sourceView = view
            popover.sourceRect = CGRect(x: view.bounds.midX, y: view.bounds.midY, width: 1, height: 1)
        }
        present(activity, animated: true)
    }

    // MARK: - External links

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url else {
            decisionHandler(.allow)
            return
        }

        let scheme = (url.scheme ?? "").lowercased()
        if ["http", "https"].contains(scheme) {
            // Google Maps, WhatsApp e links explicitamente externos abrem na app/browser apropriado.
            let host = (url.host ?? "").lowercased()
            let externalHosts = ["google.com", "www.google.com", "maps.google.com", "wa.me", "api.whatsapp.com"]
            if externalHosts.contains(where: { host == $0 || host.hasSuffix("." + $0) }) {
                UIApplication.shared.open(url)
                decisionHandler(.cancel)
                return
            }
            decisionHandler(.allow)
            return
        }

        if scheme == "whatsapp" || scheme == "maps" || scheme == "comgooglemaps" {
            UIApplication.shared.open(url)
            decisionHandler(.cancel)
            return
        }

        decisionHandler(.allow)
    }

    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration,
                 for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        if let url = navigationAction.request.url {
            UIApplication.shared.open(url)
        }
        return nil
    }
}
