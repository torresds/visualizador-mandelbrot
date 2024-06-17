# 🌌 Mandelbrot
<p align="center">
<img src="https://github.com/torresds/visualizador-mandelbrot/blob/main/preview.gif?raw=true">
</p>

## ✨ Funcionalidades
- Permite zoom in e zoom out
- Permite controlar o número máximo de iterações
- Efeito panorâmico, permitindo percorrer pela representação gráfica

## ❓ O Que é o Conjunto de Mandelbrot?
O conjunto de Mandelbrot é um fractal definido no plano complexo. Ele é formado por pontos `c` para os quais a sequência gerada pela iteração da função `f(z) = z^2 + c`, começando com `z = 0`, permanece limitada em magnitude (ou seja, não tende ao infinito). 

## 🛠️ Implementação
O fractal é renderizado pela função `draw()` que usa os pixels como coordenadas no plano complexo na função `mandelbrot()`, que calcula o número máximo de iterações para um ponto complexo `c` até que alcance o número máximo de iterações controlado pelo slider. 