# Smooth Operator — strona projektu

> Generowanie trajektorii ruchu dla robotów przemysłowych
> Projekt Naukowo-Wdrożeniowy 3

Statyczna strona (HTML/CSS/JS, zero zależności i zero buildu) opisująca projekt.
Zawiera w pełni grywalnego **Snake'a** w zakładce 🐍.

## Struktura
```
index.html        — cała strona (jedna strona, dwa widoki: projekt + Snake)
assets/styles.css — style
assets/main.js    — nawigacja, animacje, lazy-load
assets/snake.js   — gra Snake
media/            — gify i obrazki z symulacji
.nojekyll         — wyłącza przetwarzanie Jekyll na GitHub Pages
```

## Podgląd lokalny
```bash
python -m http.server 8000
# otwórz http://localhost:8000
```

## Deploy na GitHub Pages
1. Utwórz repozytorium na GitHubie (np. `smooth-operator`).
2. Wypchnij kod:
   ```bash
   git init
   git add .
   git commit -m "Strona projektu Smooth Operator"
   git branch -M main
   git remote add origin https://github.com/<user>/<repo>.git
   git push -u origin main
   ```
3. W repozytorium: **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   gałąź `main`, katalog `/ (root)`. Zapisz.
4. Po chwili strona będzie pod `https://<user>.github.io/<repo>/`.

## Do uzupełnienia przed oddaniem
Linki w sekcji **Materiały** to placeholdery (`data-todo`). Podmień `href="#"`
na właściwe adresy prezentacji, plakatu, repo, wideo, raportu i danych.
