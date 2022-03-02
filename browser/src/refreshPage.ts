const maxRefreshCount = 100;

export default function refreshPage () {
  if (!localStorage.getItem('refreshCount')) {
    localStorage.setItem('refreshCount', '0');
  }

  let refreshCount = parseInt(localStorage.getItem('refreshCount'), 10);
  if (refreshCount === maxRefreshCount) {
    return;
  }
  window.setTimeout(function () {
    refreshCount++;
    localStorage.setItem('refreshCount', refreshCount.toString());
    (window.location as any).reload(true);
  }, 15000);
}
