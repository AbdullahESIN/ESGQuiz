# GitHub'a Yükleme Adımları

## 1. GitHub'da Repository Oluşturun

1. https://github.com/new adresine gidin
2. Repository name: `ESGQuiz` (veya istediğiniz isim)
3. Public veya Private seçin
4. **ÖNEMLİ**: "Initialize this repository with a README" seçeneğini **İŞARETLEMEYİN**
5. "Create repository" butonuna tıklayın

## 2. Remote Ekleme ve Push

GitHub'da repository oluşturduktan sonra, size verilen URL'yi kullanarak şu komutları çalıştırın:

```bash
# Remote ekle (YOUR_USERNAME ve REPO_NAME'i değiştirin)
git remote add origin https://github.com/YOUR_USERNAME/ESGQuiz.git

# Branch'i main olarak değiştir (eğer master kullanıyorsanız)
git branch -M main

# İlk push
git push -u origin main
```

Eğer branch'iniz zaten `master` ise ve GitHub'da `main` kullanmak istemiyorsanız:

```bash
git remote add origin https://github.com/YOUR_USERNAME/ESGQuiz.git
git push -u origin master
```

## 3. Sonraki Değişiklikler İçin

Gelecekte değişiklik yaptığınızda:

```bash
git add .
git commit -m "Değişiklik açıklaması"
git push
```

## Sorun Giderme

### Eğer "remote origin already exists" hatası alırsanız:
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/ESGQuiz.git
```

### Eğer branch ismi uyuşmazlığı varsa:
```bash
git push -u origin master:main
```
