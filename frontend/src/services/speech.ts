export function speak(text: string): void {
  const synthesis = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-ES';
  synthesis.speak(utterance);
}
