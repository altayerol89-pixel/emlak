"use strict";

document.body.classList.add("is-loading");

const loader = document.querySelector(".loader");
const header = document.querySelector(".header");
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

window.addEventListener("load", () => {
  window.setTimeout(() => {
    loader.classList.add("is-hidden");
    document.body.classList.remove("is-loading");
  }, reduceMotion ? 0 : 1150);
});

window.addEventListener("scroll", () => {
  header.classList.toggle("is-scrolled", window.scrollY > 30);
}, { passive: true });

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.classList.toggle("is-open");
  nav.classList.toggle("is-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Menüyü kapat" : "Menüyü aç");
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.classList.remove("is-open");
    nav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

document.querySelectorAll(".magnetic").forEach((element) => {
  element.addEventListener("mousemove", (event) => {
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    element.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
  });
  element.addEventListener("mouseleave", () => {
    element.style.transform = "translate(0, 0)";
  });
});

const slides = [...document.querySelectorAll(".hero-slide")];
const currentCounter = document.querySelector(".hero__counter .current");
const progress = document.querySelector(".hero__progress");
const nextButton = document.querySelector(".slider-btn.next");
const prevButton = document.querySelector(".slider-btn.prev");
let activeSlide = 0;
let sliderTimer;

function restartProgress() {
  progress.classList.add("is-reset");
  void progress.offsetWidth;
  progress.classList.remove("is-reset");
}

function showSlide(index) {
  slides[activeSlide].classList.remove("is-active");
  slides[activeSlide].setAttribute("aria-hidden", "true");
  activeSlide = (index + slides.length) % slides.length;
  slides[activeSlide].classList.add("is-active");
  slides[activeSlide].setAttribute("aria-hidden", "false");
  currentCounter.textContent = String(activeSlide + 1).padStart(2, "0");
  restartProgress();
  window.clearInterval(sliderTimer);
  if (!reduceMotion) sliderTimer = window.setInterval(() => showSlide(activeSlide + 1), 6000);
}

nextButton.addEventListener("click", () => showSlide(activeSlide + 1));
prevButton.addEventListener("click", () => showSlide(activeSlide - 1));
document.querySelector(".hero").addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") showSlide(activeSlide + 1);
  if (event.key === "ArrowLeft") showSlide(activeSlide - 1);
});
if (!reduceMotion) sliderTimer = window.setInterval(() => showSlide(activeSlide + 1), 6000);

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.16, rootMargin: "0px 0px -6% 0px" });

document.querySelectorAll(".reveal, .reveal-text").forEach((element) => revealObserver.observe(element));

const stats = document.querySelectorAll("[data-count]");
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const element = entry.target;
    const target = Number(element.dataset.count);
    const startTime = performance.now();
    const duration = reduceMotion ? 1 : 1400;
    const update = (time) => {
      const progressValue = Math.min((time - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progressValue, 3);
      element.textContent = String(Math.round(target * eased));
      if (progressValue < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
    statsObserver.unobserve(element);
  });
}, { threshold: 0.5 });
stats.forEach((stat) => statsObserver.observe(stat));

const showcase = document.querySelector(".showcase");
const frames = [...document.querySelectorAll(".showcase-frame")];
const showcaseCurrent = document.querySelector(".showcase__index span:first-child");
const contactImage = document.querySelector(".contact__image");

function handleScrollEffects() {
  if (!reduceMotion) {
    const rect = showcase.getBoundingClientRect();
    const scrollable = showcase.offsetHeight - window.innerHeight;
    const progressValue = Math.max(0, Math.min(1, -rect.top / scrollable));
    const segment = Math.min(2, Math.floor(progressValue * 3));

    frames.forEach((frame, index) => {
      const distance = Math.abs(index - progressValue * 2.5);
      const opacity = Math.max(0, Math.min(1, 1.4 - distance * 1.5));
      const y = (index - progressValue * 2.5) * 55;
      const scale = 0.94 + opacity * 0.06;
      frame.style.opacity = String(opacity);
      frame.style.transform = window.innerWidth <= 900
        ? `translateY(${y}px) scale(${scale})`
        : `translateY(calc(-50% + ${y}px)) scale(${scale})`;
    });

    showcaseCurrent.textContent = String(segment + 1).padStart(2, "0");

    const contactRect = document.querySelector(".contact").getBoundingClientRect();
    if (contactRect.top < window.innerHeight && contactRect.bottom > 0) {
      const offset = (window.innerHeight - contactRect.top) / (window.innerHeight + contactRect.height);
      contactImage.style.transform = `scale(1.1) translateY(${(offset - 0.5) * 7}%)`;
    }
  }
  requestAnimationFrame(handleScrollEffects);
}
requestAnimationFrame(handleScrollEffects);
