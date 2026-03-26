import { useState, useRef } from 'react'
import Display from './display'
import GraphPanel from './graphpanel'
import nerdamer from 'nerdamer/all.min'

function Calculator() {
  const [resultado, setResultado] = useState("")
  const [mostrarGrafico, setMostrarGrafico] = useState(false)
  const [funcaoGrafico, setFuncaoGrafico] = useState("")

  const mfRef = useRef(null)

  const limparTela = () => {
    if (mfRef.current) {
      mfRef.current.value = "";
      setResultado("");
      setFuncaoGrafico("");
      mfRef.current.focus();
    }
  }

  // --- O NOSSO TRADUTOR OFICIAL (À prova de setinhas! 🏹) ---
  const traduzirParaNerdamer = (textoAscii) => {
    let texto = textoAscii.replace(/(?:->|→|\\rightarrow)$/g, '').replace(/_$/g, '').trim();
    texto = texto.replace(/^f\([a-zA-Z]\)=|^y=/, '');

    const regexDerivada = /(?:\(?d\)?\s*\/\s*\(?d\s*([a-zA-Z])\)?|frac\s*[{(]d[)}][{(]d\s*([a-zA-Z])[)}])\s*[({](.*)[})]/;
    if (regexDerivada.test(texto)) {
      const match = texto.match(regexDerivada);
      const variavel = match[1] || match[2];
      const equacao = match[3];
      return `diff(${equacao}, ${variavel})`;
    }

    const regexLimite = /lim\s*_\s*[{(]\s*([a-zA-Z])\s*(?:->|→)\s*([^)}]+)[)}]\s*(.*)/;
    if (regexLimite.test(texto)) {
      return texto.replace(regexLimite, 'limit($3, $1, $2)');
    }

    const regexIntegral = /int\s*(.*)d\s*([a-zA-Z])/;
    if (regexIntegral.test(texto)) {
      return texto.replace(regexIntegral, 'integrate($1, $2)');
    }

    return texto;
  };

  // --- CÁLCULO E GRÁFICO (Versão Limpa de Produção 🚀) ---
  const calcularResultado = () => {
    if (!mfRef.current) return;

    try {
      const expressaoTexto = mfRef.current.getValue('ascii-math');
      if (!expressaoTexto) return;

      const textoTraduzido = traduzirParaNerdamer(expressaoTexto);
      let textoParaGrafico = textoTraduzido;

      if (textoTraduzido.startsWith('limit(') || textoTraduzido.startsWith('diff(') || textoTraduzido.startsWith('integrate(')) {
        const matchCorpo = textoTraduzido.match(/^[a-z]+\(([^,]+),/);
        if (matchCorpo) {
          textoParaGrafico = matchCorpo[1];
        }
      }

      const temLetrasProibidas = /[a-df-wyz]/i.test(textoParaGrafico.replace(/\s/g, ''));

      if (!temLetrasProibidas || textoParaGrafico.trim().toLowerCase() === 'x') {
        try {
          const funcaoFormatada = nerdamer(textoParaGrafico).text();
          setFuncaoGrafico(funcaoFormatada);
          // Olha a mágica do JS moderno aqui embaixo! Sem o (e)
        } catch {
          setFuncaoGrafico(textoParaGrafico);
        }
      }

      const solucao = nerdamer(textoTraduzido).evaluate().toString();
      setResultado(solucao);

      // Sem o (erro) aqui também!
    } catch {
      setResultado("Ops! Expressão inválida 🎀");
    }
  }

  return (
    // Adicionamos 'relative' e 'overflow-visible' para o mascote "espiar" por cima
    <div className="relative overflow-visible bg-white/95 backdrop-blur-sm p-4 md:p-8 rounded-[2rem] shadow-2xl border-4 border-pink-400 w-full max-w-lg mx-auto mt-16 md:mt-0">

      {/* TUDO DAQUI PARA BAIXO GANHA 'relative z-10' PARA FICAR POR CIMA DA ESTAMPA */}
      <div className="relative z-10">
        <h2 className="text-pink-400 font-bold text-center mb-2 md:mb-4 text-sm md:text-lg">
          Digite sua equação abaixo:
        </h2>

        <Display mfRef={mfRef} />
        
        {resultado && (
          <div className="bg-green-100/90 border-2 border-green-300 text-green-800 p-4 rounded-xl mb-6 text-center font-bold text-xl md:text-2xl shadow-inner break-words backdrop-blur-sm">
            ✨ Resposta: {resultado}
          </div>
        )}

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