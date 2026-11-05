package com.rjp.chulaxuta;

import android.content.Context;
import org.json.JSONObject;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;
import java.util.Locale;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/** Download e verificação do bundle OTA. Não altera a versão ativa sem validação. */
final class OtaBundle {
    static final String MANIFEST = "https://raw.githubusercontent.com/ruijpedro/Chuta/main/ota/manifest.json";
    static final String APP_ID = "com.rjp.chulaxuta";
    static final String NATIVE_VERSION = "1.59.0";
    private OtaBundle() {}

    static JSONObject getManifest() throws Exception {
        HttpURLConnection c = (HttpURLConnection)new URL(MANIFEST).openConnection();
        c.setConnectTimeout(10000); c.setReadTimeout(15000);
        try (InputStream in = c.getInputStream()) {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] b = new byte[8192]; int n;
            while ((n=in.read(b))!=-1) {out.write(b,0,n);if(out.size()>65536)throw new IOException("Manifesto demasiado grande");}
            return new JSONObject(out.toString("UTF-8"));
        } finally {c.disconnect();}
    }

    static int compare(String a, String b) {
        String[] x=a.split("\\."), y=b.split("\\.");
        if(x.length!=3||y.length!=3)throw new IllegalArgumentException("SemVer inválido");
        for(int i=0;i<3;i++){int d=Integer.compare(Integer.parseInt(x[i]),Integer.parseInt(y[i]));if(d!=0)return d;}
        return 0;
    }

    static File stage(Context context, JSONObject m, String current) throws Exception {
        if(!APP_ID.equals(m.getString("appId")))throw new SecurityException("appId diferente");
        String version=m.getString("version"), min=m.getString("minNativeVersion");
        if(compare(version,current)<=0||compare(NATIVE_VERSION,min)<0)return null;
        String url=m.optString("url",""), checksum=m.optString("checksum","");
        if(!url.startsWith("https://github.com/ruijpedro/Chuta/releases/download/ota-v") ||
                !url.endsWith(".zip") || !checksum.matches("[a-fA-F0-9]{64}"))return null;
        File parent=new File(context.getFilesDir(),"ota"), dir=new File(parent,"staged-"+version);
        if(!parent.exists()&&!parent.mkdirs())throw new IOException("Diretório OTA");
        File zip=File.createTempFile("ota-", ".zip",parent);
        MessageDigest digest=MessageDigest.getInstance("SHA-256");
        try {
            HttpURLConnection c=(HttpURLConnection)new URL(url).openConnection();
            c.setConnectTimeout(15000);c.setReadTimeout(30000);
            try(InputStream in=c.getInputStream();OutputStream out=new FileOutputStream(zip)){
                byte[] buf=new byte[8192];int n;long size=0;
                while((n=in.read(buf))!=-1){
                    size+=n;if(size>20*1024*1024)throw new IOException("Pacote demasiado grande");
                    digest.update(buf,0,n);out.write(buf,0,n);
                }
            }finally{c.disconnect();}
            StringBuilder hash=new StringBuilder();
            for(byte b:digest.digest())hash.append(String.format(Locale.ROOT,"%02x",b&255));
            if(!hash.toString().equalsIgnoreCase(checksum))throw new SecurityException("SHA256 inválido");
            if(dir.exists())delete(dir);
            if(!dir.mkdirs())throw new IOException("Falha ao preparar pacote");
            try(ZipInputStream zin=new ZipInputStream(new FileInputStream(zip))){
                ZipEntry entry;long total=0;int count=0;
                while((entry=zin.getNextEntry())!=null){
                    if(++count>300)throw new IOException("Demasiados ficheiros");
                    File dest=new File(dir,entry.getName());
                    if(!dest.getCanonicalPath().startsWith(dir.getCanonicalPath()+File.separator))throw new SecurityException("Zip traversal");
                    if(entry.isDirectory()){if(!dest.isDirectory()&&!dest.mkdirs())throw new IOException("Diretório inválido");continue;}
                    if(!dest.getParentFile().isDirectory()&&!dest.getParentFile().mkdirs())throw new IOException("Diretório inválido");
                    try(OutputStream out=new FileOutputStream(dest)){
                        byte[] buf=new byte[8192];int n;
                        while((n=zin.read(buf))!=-1){total+=n;if(total>30*1024*1024)throw new IOException("Extração demasiado grande");out.write(buf,0,n);}
                    }
                }
            }
            if(!new File(dir,"index.html").isFile())throw new IOException("index.html ausente");
            return dir;
        }catch(Exception ex){if(dir.exists())delete(dir);throw ex;}
        finally{zip.delete();}
    }

    private static void delete(File f){
        if(f.isDirectory()){File[] children=f.listFiles();if(children!=null)for(File c:children)delete(c);}
        f.delete();
    }
}
