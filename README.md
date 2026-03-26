# Kitty Calc - Calculadora Tematizada

Uma calculadora interativa e elegante para cálculos matemáticos avançados, incluindo limites, integrais, derivadas e operações básicas, com um tema adorável de gatinhos. Desenvolvida para facilitar o aprendizado e uso de matemática avançada, com interface moderna em Dark Mode e suporte a Android.

## Funcionalidades

- **Cálculos Avançados**: Suporte a derivadas, integrais definidas e indefinidas, limites e operações matemáticas básicas.
- **Entrada Matemática Intuitiva**: Editor MathLive para digitar expressões matemáticas de forma natural, com suporte a notação LaTeX-like.
- **Visualização Gráfica**: Geração automática de gráficos para funções usando a variável x, com animações suaves.
- **Tema Personalizável**: Design com tema de gatinhos, cores pastel e efeitos de glassmorphism.
- **Responsivo**: Interface otimizada para dispositivos móveis e desktop.
- **Suporte a Android**: Configurado com Capacitor para build e instalação em dispositivos Android.
- **Feedback Visual**: Animações e transições suaves para uma experiência interativa.

## Como usar

1. Clone ou baixe o repositório.
2. Certifique-se de ter o Node.js instalado.
3. No terminal, instale as dependências com `npm install`.
4. Inicie o servidor de desenvolvimento com `npm run dev`.
5. Para Android: Execute `npx cap add android` e `npx cap run android` para build e instalação no dispositivo/emulador.
6. Acesse o link gerado no terminal (geralmente http://localhost:5173) ou abra no dispositivo Android.

## Tecnologias utilizadas

- **React**: Biblioteca para construção da interface e gerenciamento de estados.
- **Tailwind CSS**: Estilização utilitária, responsividade e efeitos de Dark Mode (Glow e Glassmorphism).
- **Vite**: Ferramenta de build ultrarrápida para o ambiente de desenvolvimento.
- **MathLive**: Editor matemático para entrada de expressões.
- **Nerdamer**: Biblioteca para cálculos simbólicos (derivadas, integrais, limites).
- **Function-Plot**: Biblioteca para renderização de gráficos matemáticos.
- **Capacitor**: Framework para desenvolvimento de apps híbridos, configurado para Android.
- **JavaScript (ES6+)**: Lógica de manipulação de estados e integração com bibliotecas matemáticas.

## Estrutura do projeto

```
thematized-calc/
├── index.html                 # Página principal
├── package.json               # Scripts e dependências do projeto
├── vite.config.js             # Configuração do Vite
├── capacitor.config.json      # Configuração do Capacitor
├── eslint.config.js           # Configuração do ESLint
├── src/
│   ├── App.jsx                # Lógica principal, estados e interface
│   ├── App.css                # Estilos adicionais
│   ├── index.css              # Configuração e diretivas do Tailwind
│   ├── main.jsx               # Ponto de entrada do React no DOM
│   └── components/
│       ├── calculator.jsx     # Componente principal da calculadora
│       ├── display.jsx        # Componente de exibição da entrada
│       ├── keypad.jsx         # Componente do teclado (se usado)
│       ├── button.jsx         # Componente de botões
│       └── graphpanel.jsx     # Componente do painel de gráficos
├── public/                    # Ativos estáticos (ícones, etc.)
├── android/                   # Configurações e builds para Android via Capacitor
└── README.md                  # Este arquivo
```

## Personalização

- Para alterar temas, edite as classes Tailwind no `src/App.jsx` e `src/components/calculator.jsx`.
- Adicione novos cálculos modificando a função `traduzirParaNerdamer` em `calculator.jsx`.
- Para personalizar gráficos, ajuste as opções em `graphpanel.jsx`.
- Animações podem ser ajustadas nas transições do Tailwind.

## Licença

Este projeto é open-source e pode ser usado livremente. Desenvolvido com dedicação para fins educacionais e portfólio.

## Demonstração

https://akamigliori.github.io/kitty-calc/

---

*Desenvolvido em 2026 como um projeto pessoal de aprendizado em React, Tailwind CSS e matemática computacional.*
