import type { UILocale } from './ui-copy';

// Copy for the AI menu-layout diagnosis card. Browser-safe; other flags use
// the whole-page translation flow.
export const diagnosisCopy: Record<UILocale, { title: string; body: string; placeholder: string; button: string; loading: string; resultLabel: string; error: string }> = {
  en: {
    title: '🛠️ Menu looks off on your device?',
    body: 'Describe the menu layout issue you see and our AI will identify the likely cause and suggest a fix.',
    placeholder: 'e.g. The menu buttons overlap each other on my phone in landscape mode…',
    button: 'Diagnose with AI',
    loading: 'Analyzing your description…',
    resultLabel: 'Likely cause & suggested fix',
    error: 'The AI diagnosis is unavailable right now. Please try again in a moment.',
  },
  es: {
    title: '🛠️ ¿El menú se ve mal en su dispositivo?',
    body: 'Describa el problema de diseño del menú que ve y nuestra IA identificará la causa probable y sugerirá una solución.',
    placeholder: 'p. ej. Los botones del menú se superponen en mi teléfono en modo horizontal…',
    button: 'Diagnosticar con IA',
    loading: 'Analizando su descripción…',
    resultLabel: 'Causa probable y solución sugerida',
    error: 'El diagnóstico de IA no está disponible ahora. Inténtelo de nuevo en un momento.',
  },
  tl: {
    title: '🛠️ Hindi maayos ang menu sa iyong device?',
    body: 'Ilarawan ang problema sa layout ng menu na nakikita mo at matutukoy ng aming AI ang malamang na sanhi at imumungkahing solusyon.',
    placeholder: 'hal. Nag-o-overlap ang mga button ng menu sa aking telepono kapag naka-landscape…',
    button: 'I-diagnose gamit ang AI',
    loading: 'Sinusuri ang iyong paglalarawan…',
    resultLabel: 'Malamang na sanhi at imumungkahing solusyon',
    error: 'Hindi available ang AI diagnosis ngayon. Subukan muli mamaya.',
  },
  zh: {
    title: '🛠️ 菜单在您的设备上显示异常？',
    body: '描述您看到的菜单布局问题，我们的 AI 将找出可能的原因并建议解决方法。',
    placeholder: '例如：在我的手机横屏模式下，菜单按钮相互重叠……',
    button: '用 AI 诊断',
    loading: '正在分析您的描述……',
    resultLabel: '可能的原因与建议的解决方法',
    error: 'AI 诊断暂时不可用，请稍后再试。',
  },
  de: {
    title: '🛠️ Menü sieht auf Ihrem Gerät falsch aus?',
    body: 'Beschreiben Sie das Menü-Layout-Problem, das Sie sehen, und unsere KI ermittelt die wahrscheinliche Ursache und schlägt eine Lösung vor.',
    placeholder: 'z. B. Die Menüschaltflächen überlappen sich auf meinem Handy im Querformat…',
    button: 'Mit KI diagnostizieren',
    loading: 'Ihre Beschreibung wird analysiert…',
    resultLabel: 'Wahrscheinliche Ursache & Lösungsvorschlag',
    error: 'Die KI-Diagnose ist derzeit nicht verfügbar. Bitte versuchen Sie es gleich erneut.',
  },
  ja: {
    title: '🛠️ お使いの端末でメニューの表示がおかしいですか？',
    body: '見えているメニューレイアウトの問題を説明してください。AI が原因を特定し、解決策を提案します。',
    placeholder: '例：スマホを横向きにするとメニューボタンが重なって表示される…',
    button: 'AI で診断',
    loading: '説明を分析しています…',
    resultLabel: '考えられる原因と提案される解決策',
    error: '現在 AI 診断は利用できません。しばらくしてからもう一度お試しください。',
  },
};
