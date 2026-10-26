# Publicar no GitHub Pages

O repositório inclui um workflow que, a cada push na `main`, publica o site na branch **`gh-pages`**.

## Ativação única (obrigatória)

1. Abra **[Settings → Pages](https://github.com/wem1982/queryanalizer/settings/pages)** do repositório (é preciso estar logado como `wem1982`).
2. Em **Build and deployment → Source**, escolha **Deploy from a branch**.
3. Em **Branch**, selecione **`gh-pages`** e pasta **`/ (root)`**, depois **Save**.
4. Aguarde 1–3 minutos. O site ficará em:

   **https://wem1982.github.io/queryanalizer/**

Se o workflow **Deploy GitHub Pages** ainda não tiver rodado, vá em **Actions** → **Deploy GitHub Pages** → **Run workflow**.

## Alternativa sem branch `gh-pages`

Em **Settings → Pages**, use **Branch `main`** e pasta **`/ (root)`**. O site também será servido a partir do `index.html` na raiz, sem depender da branch `gh-pages`.

## Permissões do Actions

Em **Settings → Actions → General → Workflow permissions**, use **Read and write permissions** para o token conseguir atualizar a branch `gh-pages`.
