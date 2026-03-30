import { useState, useRef, useEffect } from 'react'
import Display from './display'
import GraphPanel from './graphpanel'
import nerdamer from 'nerdamer/all.min'
import 'nerdamer/Algebra'
import 'nerdamer/Calculus'
import * as math from 'mathjs'

function Calculator() {
  const [resultado, setResultado] = useState("")
  const [resultadoLatex, setResultadoLatex] = useState("")
  const [mostrarGrafico, setMostrarGrafico] = useState(false)
  const [funcaoGrafico, setFuncaoGrafico] = useState("")
  const [erro, setErro] = useState("")

  const mfRef = useRef(null)

  useEffect(() => {
    if (mfRef.current) {
      mfRef.current.virtualKeyboardMode = "onfocus"
      mfRef.current.virtualKeyboards = "all"
    }
  }, [])

  const limparTela = () => {
    if (mfRef.current) {
      mfRef.current.value = "";
      setResultado("");
      setResultadoLatex("");
      setFuncaoGrafico("");
      setErro("");
      mfRef.current.focus();
    }
  }
  
  // ============================================================
  // CONVERSOR LaTeX → formato nerdamer
  // ============================================================
  
  // Função auxiliar para balancear parênteses
  // Remove apenas parênteses extras desbalanceados no início e fim
  const balancearParenteses = (str) => {
    // Remove parênteses extras no início que não têm fechamento correspondente
    let open = 0;
    let start = 0;
    for (let i = 0; i < str.length; i++) {
      if (str[i] === '(') open++;
      if (str[i] === ')') open--;
      if (open < 0) {
        // Encontramos um ) sem ( correspondente, remove ele
        start = i + 1;
        open = 0;
      }
    }
    str = str.substring(start);
    
    // Remove parênteses extras no final
    open = 0;
    let end = str.length;
    for (let i = str.length - 1; i >= 0; i--) {
      if (str[i] === ')') open++;
      if (str[i] === '(') open--;
      if (open < 0) {
        // Encontramos um ( sem ) correspondente, remove ele
        end = i;
        open = 0;
      }
    }
    return str.substring(0, end);
  }
  
  const converterLatexParaNerdamer = (latex) => {
    let expr = latex;
    
    // Primeiro: Converter setas para ->
    expr = expr.replace(/\\rightarrow/g, '->');
    expr = expr.replace(/\\to\b/g, '->');
    
    // Converter \sqrt{...} para sqrt(...)
    // Primeiro: sqrt{x+2} -> sqrt(x+2)
    expr = expr.replace(/\\sqrt\{([^{}]+)\}/g, 'sqrt($1)');
    // Depois: sqrt2 -> sqrt(2) (número após sqrt sem chave)
    expr = expr.replace(/\\sqrt([a-zA-Z0-9])/g, '(sqrt$1)');
    //sqrt isolado
    expr = expr.replace(/\\sqrt\b/g, 'sqrt');
    
    // Converter funções com \left(...\right) - uma única passagem é suficiente
    expr = expr.replace(/\\sin\\left\(/g, 'sin(');
    expr = expr.replace(/\\cos\\left\(/g, 'cos(');
    expr = expr.replace(/\\tan\\left\(/g, 'tan(');
    expr = expr.replace(/\\cot\\left\(/g, 'cot(');
    expr = expr.replace(/\\log\\left\(/g, 'log(');
    expr = expr.replace(/\\ln\\left\(/g, 'ln(');
    
    // Substituir \right) por )
    expr = expr.replace(/\\right\)/g, ')');
    expr = expr.replace(/\\right\}/g, '}');
    
    // Remover \left e \right restantes
    expr = expr.replace(/\\left\(/g, '(');
    expr = expr.replace(/\\right\(/g, '(');
    expr = expr.replace(/\\left\{/g, '{');
    expr = expr.replace(/\\right\b/g, '');
    expr = expr.replace(/\\left\b/g, '');
    
    // Remover barras invertidas restantes
    expr = expr.replace(/\\/g, '');
    
    // Converter frac{d}{dx} para frac{d}{d}{x} (separar variáveis)
    // Isso resolve o problema de {dx} ser tratado como chave única
    expr = expr.replace(/frac\{d\}\{d([a-zA-Z][a-zA-Z]?)\}/g, 'frac{d}{d$1}');
    
    // Limites: detectar e extrair o corpo primeiro
    const limiteRegex = /lim_\{([a-zA-Z])\s*->\s*([^}]+)\}(.+)$/;
    const limiteMatch = expr.match(limiteRegex);
    if (limiteMatch) {
      let corpo = limiteMatch[3];
      
      // Converter frações - máximo 5 iterações para evitar loop infinito
      for (let i = 0; i < 5 && corpo.includes('frac'); i++) {
        corpo = corpo.replace(/frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)');
      }
      
      // Converter sqrt para sqrt() - sqrt2 -> sqrt(2)
      corpo = corpo.replace(/sqrt([a-zA-Z0-9])/g, 'sqrt($1)');
      corpo = corpo.replace(/sqrt\(/g, 'sqrt(');
      
      // Limpar caracteres restantes
      corpo = corpo.replace(/[{}]/g, '');
      
      // Balancear parênteses
      corpo = balancearParenteses(corpo);
      
      const varX = limiteMatch[1].trim();
      const valor = limiteMatch[2].replace(/[{}]/g, '').trim();
      // Tratar caso especial: infty
      const valorFinal = valor === 'infty' || valor === 'infinity' ? 'infinity' : valor;
      const result = `limit(${corpo.replace(/\s+/g, '')}, ${varX}, ${valorFinal})`;
      return result;
    }
    
    // Derivadas: \frac{d}{dx}(f(x)) -> diff(f(x), x)
    // Primeiro tenta com parênteses e chave simples {d}{x}
    let derivadaRegex = /frac\{d\}\{d([a-zA-Z])\}\(([^)]+)\)$/;
    let derivadaMatch = expr.match(derivadaRegex);
    if (derivadaMatch) {
      let corpo = derivadaMatch[2];
      for (let i = 0; i < 5 && corpo.includes('frac'); i++) {
        corpo = corpo.replace(/frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)');
      }
      corpo = corpo.replace(/[{}]/g, '').replace(/\s+/g, '');
      return `diff(${corpo}, ${derivadaMatch[1]})`;
    }
    
    // Tenta com variável composta como {dx} - quando está na forma {d}{dx}
    derivadaRegex = /frac\{d\}\{([a-zA-Z]+)\}\}\(([^)]+)\)$/;
    derivadaMatch = expr.match(derivadaRegex);
    if (derivadaMatch) {
      const varX = derivadaMatch[1].charAt(derivadaMatch[1].length - 1);
      let corpo = derivadaMatch[2];
      for (let i = 0; i < 5 && corpo.includes('frac'); i++) {
        corpo = corpo.replace(/frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)');
      }
      corpo = corpo.replace(/[{}]/g, '').replace(/\s+/g, '');
      return `diff(${corpo}, ${varX})`;
    }
    
    // Tenta detectar o padrão frac{d}{dx} onde dx está tudo junto
    if (expr.includes('frac{d}{dx}') || expr.includes('frac{d}{d')) {
      const varMatch = expr.match(/frac\{d\}\{([a-zA-Z]+)\}/);
      if (varMatch) {
        const varX = varMatch[1].charAt(varMatch[1].length - 1);
        const corpoMatch = expr.match(/frac\{d\}\{[a-zA-Z]+\}\((.+)\)$/);
        if (corpoMatch) {
          let corpo = corpoMatch[1];
          for (let i = 0; i < 5 && corpo.includes('frac'); i++) {
            corpo = corpo.replace(/frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)');
          }
          corpo = corpo.replace(/[{}]/g, '').replace(/\s+/g, '');
          return `diff(${corpo}, ${varX})`;
        }
      }
    }
    
    // Derivada com (d/dx)(expr)
    derivadaRegex = /\(d\/d([a-zA-Z])\)\(([^)]+)\)$/;
    derivadaMatch = expr.match(derivadaRegex);
    if (derivadaMatch) {
      let corpo = derivadaMatch[2];
      for (let i = 0; i < 5 && corpo.includes('frac'); i++) {
        corpo = corpo.replace(/frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)');
      }
      corpo = corpo.replace(/[{}]/g, '').replace(/\s+/g, '');
      return `diff(${corpo}, ${derivadaMatch[1]})`;
    }
    if (!derivadaMatch) {
      // Tenta com variável composta como {dx} - pega a última letra
      derivadaRegex = /frac\{d\}\{d([a-zA-Z][a-zA-Z]?)\}\(([^)]+)\)$/;
      derivadaMatch = expr.match(derivadaRegex);
    }
    if (!derivadaMatch) {
      // Tenta com {dx} mas captura apenas a variável (último char)
      derivadaRegex = /frac\{d\}\{d([a-zA-Z]+)\}/;
      derivadaMatch = expr.match(derivadaRegex);
      if (derivadaMatch) {
        // Extrai apenas a variável (último caractere)
        const varComp = derivadaMatch[1];
        const varX = varComp.charAt(varComp.length - 1);
        // Agora precisa encontrar o corpo entre parênteses
        const corpoMatch = expr.match(/frac\{d\}\{d[a-zA-Z]+\}\(([^)]+)\)$/);
        if (corpoMatch) {
          let corpo = corpoMatch[1];
          for (let i = 0; i < 5 && corpo.includes('frac'); i++) {
            corpo = corpo.replace(/frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)');
          }
          corpo = corpo.replace(/[{}]/g, '').replace(/\s+/g, '');
          return `diff(${corpo}, ${varX})`;
        }
      }
    }
    if (derivadaMatch) {
      let corpo = derivadaMatch[derivadaMatch.length - 1];
      const varX = derivadaMatch[1];
      for (let i = 0; i < 5 && corpo.includes('frac'); i++) {
        corpo = corpo.replace(/frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)');
      }
      corpo = corpo.replace(/[{}]/g, '').replace(/\s+/g, '');
      return `diff(${corpo}, ${varX})`;
    }
    
    // Derivada com (d/dx)(expr)
    derivadaRegex = /\(d\/d([a-zA-Z])\)\(([^)]+)\)$/;
    derivadaMatch = expr.match(derivadaRegex);
    if (derivadaMatch) {
      let corpo = derivadaMatch[2];
      for (let i = 0; i < 5 && corpo.includes('frac'); i++) {
        corpo = corpo.replace(/frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)');
      }
      corpo = corpo.replace(/[{}]/g, '').replace(/\s+/g, '');
      return `diff(${corpo}, ${derivadaMatch[1]})`;
    }
    
    // Integrais: \int f(x) dx
    let integralRegex = /int\s+(.+)\s*d([a-zA-Z])$/;
    let integralMatch = expr.match(integralRegex);
    if (integralMatch) {
      let corpo = integralMatch[1];
      for (let i = 0; i < 5 && corpo.includes('frac'); i++) {
        corpo = corpo.replace(/frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)');
      }
      corpo = corpo.replace(/[{}]/g, '').replace(/\s+/g, '');
      return `integrate(${corpo}, ${integralMatch[2]})`;
    }
    
    // Funções trigonométricas (com e sem parênteses)
    expr = expr.replace(/sin/g, 'sin');
    expr = expr.replace(/cos/g, 'cos');
    expr = expr.replace(/tan/g, 'tan');
    expr = expr.replace(/cot/g, 'cot');
    expr = expr.replace(/sec/g, 'sec');
    expr = expr.replace(/csc/g, 'csc');
    expr = expr.replace(/arcsin/g, 'asin');
    expr = expr.replace(/arccos/g, 'acos');
    expr = expr.replace(/arctan/g, 'atan');
    
    // Funções matemáticas
    expr = expr.replace(/log/g, 'log');
    expr = expr.replace(/ln/g, 'ln');
    expr = expr.replace(/sqrt/g, 'sqrt');
    
    // Frações: \frac{a}{b} -> a/b (máximo 5 iterações para evitar loop)
    for (let i = 0; i < 5 && expr.includes('frac'); i++) {
      expr = expr.replace(/frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)');
    }
    
    // Potências
    expr = expr.replace(/\^{([^}]+)}/g, '^($1)');
    expr = expr.replace(/\^([a-zA-Z0-9])/g, '^$1');
    
    // Constantes e operadores
    expr = expr.replace(/pi/g, 'pi');
    expr = expr.replace(/cdot/g, '*');
    expr = expr.replace(/times/g, '*');
    expr = expr.replace(/div/g, '/');
    expr = expr.replace(/infty/g, 'infinity');
    
    // Limpar caracteres restantes
    expr = expr.replace(/[{}]/g, '');
    expr = expr.replace(/\s+/g, '');
    
    return expr;
  }

  // ============================================================
  // SIMPLIFICADOR DE RESULTADOS COM INFINITY
  // ============================================================
  const simplificarResultado = (valor) => {
    if (typeof valor !== 'string') return valor
    
    let result = valor.toLowerCase().replace(/\s+/g, '')
    
    // Se já é número finito, retorna como número
    const num = parseFloat(result)
    if (!isNaN(num) && isFinite(num)) {
      return num
    }
    
    // Simplificações com infinity
    // infinity^(-1) → 0
    // infinity^(-n) → 0
    if (result.includes('infinity^(-1)') || result.includes('infinity^-1') || result.includes('infinity**(-1)')) {
      return 0
    }
    if (result.match(/infinity\s*\^\s*-\s*\d+/)) {
      return 0
    }
    
    // 1/infinity → 0
    if (result === '1/infinity' || result === '1/infty') {
      return 0
    }
    
    // infinity^0 → 1
    if (result.includes('infinity^0') || result.includes('infinity**0')) {
      return 1
    }
    
    // infinity^1 → infinity
    if (result === 'infinity^1' || result === 'infinity**1' || result === 'infinity') {
      return '∞'
    }
    
    // -infinity → -∞
    if (result === '-infinity' || result === '-infty') {
      return '-∞'
    }
    
    // Se tem infinity mas não simplificou, tenta avaliar numericamente
    if (result.includes('infinity') || result.includes('infty')) {
      // Tenta substituir infinity por um número grande
      const testExpr = result.replace(/infinity/g, '1e100').replace(/infty/g, '1e100')
      try {
        const numericResult = math.evaluate(testExpr)
        if (typeof numericResult === 'number' && isFinite(numericResult)) {
          return numericResult
        }
        if (numericResult === Infinity) return '∞'
        if (numericResult === -Infinity) return '-∞'
      } catch {
        // Mantém o valor original
      }
    }
    
    return valor
  }

  // ============================================================
  // CALCULAR LIMITE NUMERICAMENTE (fallback)
  // ============================================================
  const calcularLimiteNumerico = (exprComVariavel, varName, valor) => {
    try {
      // Determinar a direção do limite
      let valorNum = 0;
      if (valor === 'infinity' || valor === 'infty') {
        valorNum = 1e10;
      } else if (valor === '-infinity' || valor === '-infty') {
        valorNum = -1e10;
      } else {
        valorNum = parseFloat(valor);
      }
      
      if (isNaN(valorNum)) return null;
      
      // Substituir a variável pelo valor
      let exprNumerica = exprComVariavel.replace(new RegExp('\\b' + varName + '\\b', 'g'), valorNum);
      
      // Avaliar numericamente
      const resultado = math.evaluate(exprNumerica);
      
      if (typeof resultado === 'number' && isFinite(resultado)) {
        return resultado;
      }
      return null;
    } catch {
      return null;
    }
  }

  // ============================================================
  // CALCULAR EXPRESSÃO
  // ============================================================
  const calcularExpressao = (latexInput) => {
    // Converte LaTeX para formato nerdamer
    const nerdamerExpr = converterLatexParaNerdamer(latexInput)
    console.log("Expressão convertida:", nerdamerExpr)
    
    // Verifica se é um limite
    const ehLimite = nerdamerExpr.startsWith('limit(');
    
    // Tenta nerdamer
    try {
      const nerdamerObj = nerdamer(nerdamerExpr)
      
      // Verifica se é um limite com infinity
      const ehLimiteInfinito = ehLimite && nerdamerExpr.includes('infinity')
      
      // Verifica se a expressão tem variáveis
      const temVariavel = /[a-zA-Z]/.test(nerdamerExpr.replace(/sin|cos|tan|log|ln|sqrt|limit|diff|integrate|pi|e|infinity/g, ''))
      
      let simplificado;
      if (temVariavel && !ehLimiteInfinito) {
        // Se tem variáveis (mas não é limite infinito), usa simplify()
        // simplify() é melhor para fatorar expressões
        simplificado = nerdamerObj.simplify()
      } else if (temVariavel && ehLimiteInfinito) {
        // Para limites com infinity, tenta evaluate que pode funcionar
        simplificado = nerdamerObj.evaluate()
      } else {
        // Se não tem variáveis, avalia numericamente
        simplificado = nerdamerObj.evaluate()
      }
      
      let valor = simplificado.toString()
      
      // Tenta converter para número (apenas se não tiver variáveis)
      if (!temVariavel) {
        const num = parseFloat(valor)
        if (!isNaN(num) && isFinite(num)) {
          return { valor: num, fonte: 'nerdamer' }
        }
      }
      
      // Se o resultado for Infinity ou incorreto para um limite, tenta cálculo numérico
      if (ehLimite && (valor === 'Infinity' || valor === 'Infinity' || !isFinite(parseFloat(valor)))) {
        // Extrai a expressão e o valor do limite
        const limiteMatch = nerdamerExpr.match(/limit\((.+),\s*([a-zA-Z]),\s*(.+)\)/);
        if (limiteMatch) {
          const corpo = limiteMatch[1];
          const varName = limiteMatch[2];
          const valorLimite = limiteMatch[3];
          
          // Calcula numericamente com valor próximo
          let valorProximo = 0;
          if (valorLimite === 'infinity' || valorLimite === 'infty') {
            valorProximo = 0.0001;
          } else if (valorLimite === '-infinity' || valorLimite === '-infty') {
            valorProximo = -0.0001;
          } else {
            valorProximo = parseFloat(valorLimite) + (parseFloat(valorLimite) === 0 ? 0.0001 : parseFloat(valorLimite) * 0.0001);
          }
          
          let exprNumerica = corpo.replace(new RegExp('\\b' + varName + '\\b', 'g'), valorProximo);
          // Substituir funções
          exprNumerica = exprNumerica.replace(/sin/g, 'Math.sin');
          exprNumerica = exprNumerica.replace(/cos/g, 'Math.cos');
          exprNumerica = exprNumerica.replace(/tan/g, 'Math.tan');
          exprNumerica = exprNumerica.replace(/sqrt/g, 'Math.sqrt');
          exprNumerica = exprNumerica.replace(/log/g, 'Math.log');
          exprNumerica = exprNumerica.replace(/ln/g, 'Math.log');
          exprNumerica = exprNumerica.replace(/\^/g, '**');
          
          try {
            const resultadoNumerico = eval(exprNumerica);
            if (typeof resultadoNumerico === 'number' && isFinite(resultadoNumerico)) {
              return { valor: Math.round(resultadoNumerico * 1e10) / 1e10, fonte: 'numérico' };
            }
          } catch {}
        }
      }
      
      // Simplificar resultados com infinity
      valor = simplificarResultado(valor)
      
      return { valor: valor, fonte: 'nerdamer' }
    } catch (e) {
      console.log("nerdamer falhou:", e.message)
      // nerdamer falhou, tenta mathjs
    }
    
    // Fallback: mathjs
    try {
      let resultado = math.evaluate(nerdamerExpr)
      
      // Simplificar resultado
      resultado = simplificarResultado(resultado)
      
      if (typeof resultado === 'number' && isFinite(resultado)) {
        return { valor: resultado, fonte: 'mathjs' }
      }
      return { valor: resultado, fonte: 'mathjs' }
    } catch {
      // mathjs também falhou
    }
    
    throw new Error("Não foi possível calcular a expressão")
  }

  // ============================================================
  // CONVERSOR RESULTADO -> LATEX (para exibir bonitinho)
  // ============================================================
  const converterParaLatex = (expressao) => {
    try {
      const nerdamerObj = nerdamer(expressao)
      return nerdamerObj.toTeX()
    } catch {
      return null
    }
  }

  // ============================================================
  // CÁLCULO PRINCIPAL
  // ============================================================
  const calcularResultado = () => {
    if (!mfRef.current) return

    setErro("")
    
    try {
      // Pega o valor do mathfield em LaTeX (formato nativo do mathlive)
      const latexValue = mfRef.current.getValue('latex')
      
      if (!latexValue || latexValue.trim() === "") {
        setErro("Digite uma expressão primeiro! 🎀")
        return
      }

      console.log("Expressão em LaTeX:", latexValue)

      // Traduz de LaTeX para formato nerdamer
      const textoTraduzido = converterLatexParaNerdamer(latexValue)
      console.log("Traduzido para nerdamer:", textoTraduzido)

      // --- PREPARA GRÁFICO ---
      let textoParaGrafico = textoTraduzido
      
      // Se for operação especial, extrai a função base
      if (textoTraduzido.startsWith('limit(') || textoTraduzido.startsWith('diff(') || textoTraduzido.startsWith('integrate(')) {
        const matchCorpo = textoTraduzido.match(/^[a-z]+\(([^,]+),/)
        if (matchCorpo) {
          textoParaGrafico = matchCorpo[1]
        }
      }

      // Verifica se tem variável (para gráfico)
      const temX = /\bx\b/i.test(textoParaGrafico)
      const temLetrasProibidas = /[a-df-wyz]/i.test(textoParaGrafico.replace(/\s/g, '').replace(/x/gi, ''))

      if (temX && !temLetrasProibidas) {
        try {
          // Simplifica para gráfico
          const nerdamerGrafico = nerdamer(textoParaGrafico)
          const funcaoFormatada = nerdamerGrafico.text()
          setFuncaoGrafico(funcaoFormatada)
        } catch {
          setFuncaoGrafico(textoParaGrafico)
        }
      } else {
        setFuncaoGrafico("")
      }

      // --- CALCULA RESULTADO ---
      const resultado = calcularExpressao(textoTraduzido)
      
      // Formata resultado
      let resultadoFormatado = resultado.valor
      if (typeof resultado.valor === 'number') {
        // Arredonda para evitar números enormes
        if (Math.abs(resultado.valor) < 1e-10) {
          resultadoFormatado = 0
        } else if (Math.abs(resultado.valor) >= 1e6 || (Math.abs(resultado.valor) < 1e-4 && resultado.valor !== 0)) {
          resultadoFormatado = resultado.valor.toExponential(4)
        } else {
          resultadoFormatado = Math.round(resultado.valor * 1e10) / 1e10
        }
      }
      
      setResultado(resultadoFormatado.toString())

      // --- TENTA CONVERTER PARA LATEX ---
      const latex = converterParaLatex(textoTraduzido)
      if (latex) {
        setResultadoLatex(latex)
      } else {
        setResultadoLatex("")
      }

    } catch (err) {
      console.error("Erro cálculo:", err)
      setErro("Ops! Não consegui calcular isso. Verifique a expressão! 🎀")
    }
  }

  return (
    <div className="relative overflow-visible bg-white/95 backdrop-blur-sm p-2 md:p-8 rounded-[2rem] shadow-2xl border-4 border-pink-400 w-full max-w-lg mx-auto mt-4 md:mt-0">

      <div className="relative z-10">
        <h2 className="text-pink-400 font-bold text-center mb-2 md:mb-4 text-sm md:text-lg">
          Digite sua equação abaixo:
        </h2>

        <Display mfRef={mfRef} onCalculate={calcularResultado} onClear={limparTela} />
        
        {/* Resultado com formato matemático */}
        {(resultado || erro) && (
          <div className={`p-4 rounded-xl mb-4 text-center shadow-inner break-words backdrop-blur-sm ${
            erro ? "bg-red-100 border-2 border-red-300 text-red-800" : "bg-green-100/90 border-2 border-green-300 text-green-800"
          }`}>
            {erro ? (
              <div className="font-bold text-lg">{erro}</div>
            ) : (
              <>
                <div className="text-sm text-green-600 mb-1">✨ Resposta:</div>
                <div className="font-bold text-xl md:text-2xl">{resultado}</div>
                {resultadoLatex && (
                  <div className="mt-2 text-lg text-green-700 italic">
                    = {resultadoLatex}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-4 md:mb-6">
          <button 
            onClick={limparTela}
            className="bg-rose-100 text-rose-600 px-5 py-2.5 rounded-full font-bold shadow-sm hover:shadow-md hover:bg-rose-200 hover:-translate-y-1 active:scale-95 transition-all duration-300 text-sm md:text-base flex-1 min-w-[100px]"
          >
            🗑️ Limpar
          </button>

          <button 
            onClick={calcularResultado}
            className="bg-pink-500 text-white px-8 py-2.5 rounded-full font-bold shadow-md hover:shadow-lg hover:shadow-pink-300/50 hover:bg-pink-600 hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-300 text-base md:text-lg flex-1 min-w-[120px]"
          >
            🧮 Calcular
          </button>

          <button 
            onClick={() => setMostrarGrafico(!mostrarGrafico)}
            className="bg-purple-100 text-purple-600 px-5 py-2.5 rounded-full font-bold shadow-sm hover:shadow-md hover:bg-purple-200 hover:-translate-y-1 active:scale-95 transition-all duration-300 text-sm md:text-base w-full mt-2 md:mt-0 md:w-auto"
          >
            📈 {mostrarGrafico ? "Esconder Gráfico" : "Ver Gráfico"}
          </button>
        </div>

        {/* Painel de Gráfico */}
        {mostrarGrafico && (
          <div className="border-4 border-dashed border-pink-200/80 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center p-2 mt-4 transition-all overflow-hidden h-64">
            {funcaoGrafico ? (
               <GraphPanel funcaoParaDesenhar={funcaoGrafico} />
            ) : (
               <p className="text-pink-400 font-bold text-center text-sm md:text-base p-8">
                 Calcule uma função com "x" para ver a mágica aqui! ✨
               </p>
            )}
          </div>
        )}
      </div>

    </div>
  )
}

export default Calculator