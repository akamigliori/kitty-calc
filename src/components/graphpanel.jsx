// src/components/GraphPanel.jsx
import { useEffect, useRef } from 'react';
// Importamos a biblioteca
import functionPlot from 'function-plot';

function GraphPanel({ funcaoParaDesenhar }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !funcaoParaDesenhar) return;

    // Limpa a tela antes de desenhar
    containerRef.current.innerHTML = '';

    if (funcaoParaDesenhar.includes('limit') || funcaoParaDesenhar.includes('diff')) {
      containerRef.current.innerHTML = `
        <p class="text-pink-500 font-bold p-4 text-center">
          🎀 O gráfico só desenha a função original.<br/>
          Tente digitar apenas a equação (ex: x^2) sem o limite ou derivada!
        </p>
      `;
      return;
    }

    try {
      // ---------------------------------------------------------
      // A NOSSA CORREÇÃO DE MESTRE AQUI 👇
      // Se a função estiver dentro da caixinha 'default', nós a tiramos de lá!
      // ---------------------------------------------------------
      const plotarGrafico = functionPlot.default || functionPlot;

      // Agora usamos a nossa variável corrigida para desenhar!
      plotarGrafico({
        target: containerRef.current,
        width: 350,
        height: 220,
        grid: true,
        data: [
          {
            fn: funcaoParaDesenhar,
            color: '#db2777', // Rosa Hello Kitty
            graphType: 'polyline',
          }
        ]
      });
      
    } catch (erro) {
      console.error("Erro do function-plot:", erro);
      containerRef.current.innerHTML = `
        <p class="text-red-500 font-bold p-4 text-center text-sm">
          Ops! O desenhista não entendeu a função:<br/>
          <span class="text-gray-700 font-mono mt-2 block">${funcaoParaDesenhar}</span>
          <br/>Erro: ${erro.message}
        </p>
      `;
    }
  }, [funcaoParaDesenhar]);

  return (
    <div ref={containerRef} className="flex justify-center items-center w-full h-full bg-white rounded-xl overflow-hidden"></div>
  );
}

export default GraphPanel;