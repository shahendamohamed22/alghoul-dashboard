import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

// ده الفرق الأساسي بين vanilla JS و React لما بتتعاملي مع مكتبة زي Chart.js:
//
// في الكود القديم كنتي بتكتبي:
//   new Chart(document.getElementById('revenueChart'), {...})
// مرة واحدة، والسكريبت يشتغل بعد ما الـ HTML يترسم خلاص.
//
// في React، الـ component ممكن يترسم (render) أكتر من مرة (لما الـ state يتغير مثلاً)،
// فلو كتبنا new Chart() جوه الـ component نفسه من غير حماية، هيتعمل شارت جديد
// فوق القديم كل مرة - وهيتراكموا فوق بعض ويبقى فيه memory leak.
//
// الحل: useRef عشان نمسك reference لـ:
//   1. الـ <canvas> DOM element نفسه (canvasRef)
//   2. الـ Chart instance اللي اتعمل (chartRef) - عشان نقدر نـ destroy القديم
//      قبل ما نعمل واحد جديد، ولما الـ component يتشال من الشاشة (unmount)
export default function ChartCanvas({ config }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // لو فيه شارت قديم على نفس الـ canvas، امسحيه الأول
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(canvasRef.current, config);

    // الـ return هنا هي "cleanup function" - React بيشغلها لما الـ component
    // يتشال من الشاشة، أو قبل ما يعيد تشغيل الـ effect ده تاني
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(config)]);

  return <canvas ref={canvasRef}></canvas>;
}
