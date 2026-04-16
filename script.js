// Scroll-triggered fade-in animation
const observer = new IntersectionObserver((entries) => {
  entries.forEach(el => {
    if (el.isIntersecting) {
      el.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.step, .feature-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

document.querySelectorAll('.step.visible, .feature-card.visible').forEach(el => {
  el.style.opacity = '1';
  el.style.transform = 'translateY(0)';
});

// Apply visible class via CSS
const style = document.createElement('style');
style.textContent = `
  .step.visible, .feature-card.visible {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }
`;
document.head.appendChild(style);

// Stagger children
document.querySelectorAll('.steps, .features').forEach(group => {
  [...group.children].forEach((child, i) => {
    if (child.classList.contains('step') || child.classList.contains('feature-card')) {
      child.style.transitionDelay = `${i * 0.08}s`;
    }
  });
});
