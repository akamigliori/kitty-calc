# Agentes para Calculadora Themathized

## Visão Geral do Projeto

Calculadora web React com operações matemáticas avançadas (limites, derivadas, integrais) além de operações básicas. Utiliza:
- **React + Vite** - Framework
- **mathlive** - Campo matemático com teclado virtual (insere LaTeX)
- **nerdamer** - Cálculo simbólico (limites, derivadas, integrais)
- **mathjs** - Cálculo numérico rápido
- **function-plot** - Gráficos de funções

## Estrutura de Arquivos

```
src/
├── components/
│   ├── calculator.jsx   # Lógica principal de cálculo e parsing
│   ├── display.jsx       # math-field (mathlive)
│   ├── keypad.jsx       # Botões de funções matemáticas
│   └── graphpanel.jsx   # Renderização de gráficos
├── App.jsx
├── main.jsx
└── index.css
```

## Problema Original

### Sintomas
- Limites simples como lim x->0 (sin(x)/x) não funcionam
- A calculadora não entende o que o usuário digita no display

### Causa Raiz
O math-field (mathlive) usa LaTeX internamente. O código usava `getValue('ascii-math')` que não funcionava corretamente sem o Compute Engine.

## Correção Aplicada

### Mudanças em calculator.jsx:

1. **Mudou de ascii-math para LaTeX**: Agora usa `mfRef.current.getValue('latex')` para obter o valor

2. **Novo parser LaTeX→nerdamer**: Criada função `converterLatexParaNerdamer()` que:
   - Detecta limites: `\lim_{x\to 0}(f(x))` → `limit(f(x), x, 0)`
   - Detecta derivadas: `\frac{d}{dx}(f(x))` → `diff(f(x), x)`
   - Detecta integrais: `\int f(x) dx` → `integrate(f(x), x)`
   - Converte funções trigonométricas: `\sin` → `sin`
   - Converte frações: `\frac{a}{b}` → `(a)/(b)`

3. **Carregados módulos extras do nerdamer**:
   ```javascript
   import 'nerdamer/Algebra'
   import 'nerdamer/Calculus'
   ```

### Fluxo Correto

```
Usuário digita no math-field → getValue('latex') → converterLatexParaNerdamer() → nerdamer → resultado
```

## Testes Verificados

| Expressão LaTeX | Resultado |
|----------------|-----------|
| `\lim_{x\to 0}(\frac{\sin(x)}{x})` | 1 |
| `x^2 + 2x + 1` | `(x+1)^2` |

## Comandos de Teste

```bash
npm run dev    # Desenvolvimento
npm run build  # Build
npm run lint   # Lint
```
