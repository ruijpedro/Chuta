package com.rjp.chulaxuta;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.content.ActivityNotFoundException;
import android.os.Bundle;
import android.os.Build;
import android.content.SharedPreferences;
import java.io.File;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceError;

public class MainActivity extends Activity {
    private WebView webView;
    private static final String OTA_PREFS = "cx_ota";
    private String currentWebUrl() {
        SharedPreferences p=getSharedPreferences(OTA_PREFS,MODE_PRIVATE);
        String version=p.getString("active_version","");
        if(!version.matches("[0-9]+\\.[0-9]+\\.[0-9]+"))return "file:///android_asset/index.html";
        File file=new File(new File(new File(getFilesDir(),"ota"),"staged-"+version),"index.html");
        return file.isFile()?"file://"+file.getAbsolutePath():"file:///android_asset/index.html";
    }
    private void checkOtaAsync(){
        new Thread(()->{
            try {
                org.json.JSONObject m=OtaBundle.getManifest();
                SharedPreferences p=getSharedPreferences(OTA_PREFS,MODE_PRIVATE);
                String current=p.getString("active_version",OtaBundle.NATIVE_VERSION);
                File staged=OtaBundle.stage(this,m,current);
                if(staged==null)return;
                String version=m.getString("version");
                p.edit().putString("previous_version",current).putString("active_version",version).apply();
                runOnUiThread(()->{
                    if(webView!=null)webView.evaluateJavascript("window.chutaXutaOTA&&window.chutaXutaOTA.installed("+org.json.JSONObject.quote(version)+")",null);
                });
            }catch(Exception e){android.util.Log.w("ChutaOTA","Atualização não aplicada",e);}
        },"Chuta-OTA").start();
    }

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);

        webView = new WebView(this);
        webView.setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_FULLSCREEN |
                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY |
                View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
                View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION |
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        );

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }

        webView.setWebViewClient(new WebViewClient() {
            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view,request,error);
                if (Build.VERSION.SDK_INT >= 23 && request.isForMainFrame()
                        && request.getUrl().toString().contains("/files/ota/staged-")) {
                    SharedPreferences p=getSharedPreferences(OTA_PREFS,MODE_PRIVATE);
                    String previous=p.getString("previous_version","");
                    p.edit().putString("active_version",previous).remove("previous_version").apply();
                    view.loadUrl(currentWebUrl());
                }
            }
        });
        webView.setWebChromeClient(new WebChromeClient());
        webView.addJavascriptInterface(new ChutaBridge(), "ChutaAndroid");
        webView.addJavascriptInterface(new ChutaBridge(), "ChutaBridge");
        setContentView(webView);
        webView.loadUrl(currentWebUrl());
        checkOtaAsync();
    }


    public class ChutaBridge {
        @JavascriptInterface
        public void restartApp() {
            runOnUiThread(() -> {
                if (webView != null) {
                    webView.clearHistory();
                    webView.loadUrl(currentWebUrl());
                }
            });
        }
        @JavascriptInterface
        public void shareWhatsApp(String text) {
            try {
                Intent sendIntent = new Intent(Intent.ACTION_SEND);
                sendIntent.setType("text/plain");
                sendIntent.putExtra(Intent.EXTRA_TEXT, text);
                sendIntent.setPackage("com.whatsapp");
                startActivity(sendIntent);
            } catch (ActivityNotFoundException e) {
                Intent sendIntent = new Intent(Intent.ACTION_SEND);
                sendIntent.setType("text/plain");
                sendIntent.putExtra(Intent.EXTRA_TEXT, text);
                startActivity(Intent.createChooser(sendIntent, "Partilhar"));
            } catch (Exception e) {
                Intent sendIntent = new Intent(Intent.ACTION_SEND);
                sendIntent.setType("text/plain");
                sendIntent.putExtra(Intent.EXTRA_TEXT, text);
                startActivity(Intent.createChooser(sendIntent, "Partilhar"));
            }
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
