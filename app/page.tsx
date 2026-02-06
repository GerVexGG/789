'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    AOS?: {
      init: (config: { once: boolean; duration: number; offset: number }) => void;
    };
  }
}

const navLinks = [
  { href: '#specs', label: 'Железо', section: 'specs' },
  { href: '#pricing', label: 'Тарифы', section: 'pricing' },
  { href: '#tournaments', label: 'Турниры', section: 'tournaments' },
  { href: '#schedule', label: 'Расписание', section: 'schedule' },
  { href: '#games', label: 'Игры', section: 'games' },
  { href: '#contact', label: 'Контакты', section: 'contact' }
];

const occupancyValues = [
  { label: 'Стандарт', value: 78 },
  { label: 'VIP', value: 52 },
  { label: 'Bootcamp', value: 64 },
  { label: 'VR Zone', value: 41 }
];

const modalIds = new Set([
  'bookingModal',
  'videoModal1',
  'videoModal2',
  'videoModal3',
  'gameModal1',
  'gameModal2',
  'gameModal3',
  'gameModal4',
  'gameModal5',
  'gameModal6'
]);

export default function Home() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (window.AOS) {
      window.AOS.init({
        once: true,
        duration: 800,
        offset: 100
      });
    }
  }, []);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveModal(null);
      }
    };

    window.addEventListener('keydown', handleKeydown);

    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = activeModal ? 'hidden' : 'auto';
    if (!activeModal) {
      document.querySelectorAll<HTMLVideoElement>('video').forEach((video) => video.pause());
    }
  }, [activeModal]);

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('section[id]');
    const linkElements = document.querySelectorAll<HTMLAnchorElement>('.nav-link');
    const header = document.querySelector('header');
    const scrollTopBtn = document.getElementById('scrollTop');

    const highlightActiveMenu = () => {
      let current = 'hero';
      const fromTop = window.scrollY + 150;

      sections.forEach((section) => {
        if (section.offsetTop <= fromTop) {
          current = section.id;
        }
      });

      linkElements.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === current) {
          link.classList.add('active');
        }
      });
    };

    const handleScroll = () => {
      if (header && scrollTopBtn) {
        if (window.scrollY > 100) {
          header.classList.add('scrolled');
          scrollTopBtn.classList.add('show');
        } else {
          header.classList.remove('scrolled');
          scrollTopBtn.classList.remove('show');
        }
      }
      highlightActiveMenu();
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('load', highlightActiveMenu);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('load', highlightActiveMenu);
    };
  }, []);

  useEffect(() => {
    const counters = document.querySelectorAll<HTMLDivElement>('.stat-number');
    const speed = 200;

    counters.forEach((counter) => {
      const target = Number(counter.getAttribute('data-count'));
      let count = 0;
      const increment = target / speed;

      const updateCount = () => {
        count += increment;
        if (count < target) {
          counter.textContent = Math.ceil(count).toString();
          window.setTimeout(updateCount, 10);
        } else {
          counter.textContent = `${target}${target === 10000 ? '+' : ''}`;
        }
      };

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && counter.textContent === '0') {
              updateCount();
            }
          });
        },
        { threshold: 0.5 }
      );

      observer.observe(counter);
    });
  }, []);

  useEffect(() => {
    const bars = document.querySelectorAll<HTMLSpanElement>('[data-occupancy]');
    if (!bars.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const bar = entry.target as HTMLSpanElement;
            const value = bar.getAttribute('data-occupancy');
            if (value) {
              bar.style.width = `${value}%`;
            }
            observer.unobserve(bar);
          }
        });
      },
      { threshold: 0.4 }
    );

    bars.forEach((bar) => observer.observe(bar));
  }, []);

  const handleSmoothScroll = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const target = event.currentTarget.getAttribute('href');
    if (!target || !target.startsWith('#')) return;

    const section = document.querySelector<HTMLElement>(target);
    if (section) {
      event.preventDefault();
      const offsetTop = section.offsetTop - 80;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
    setMenuOpen(false);
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = formRef.current;
    if (!form) return;

    const requiredInputs = form.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
      'input[required], select[required]'
    );
    let isValid = true;

    requiredInputs.forEach((input) => {
      if (!input.value) {
        input.style.borderColor = '#ff0000';
        input.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.5)';
        isValid = false;
      } else {
        input.style.borderColor = '';
        input.style.boxShadow = '';
      }
    });

    if (isValid) {
      alert(
        '✅ Заявка успешно отправлена!\n\nМы свяжемся с вами в ближайшее время для подтверждения брони.\n\n(Это демо-версия)'
      );
      form.reset();
      setActiveModal(null);
    } else {
      alert('❌ Пожалуйста, заполните все обязательные поля!');
    }
  };

  const handleModalToggle = (modalId: string | null) => {
    if (modalId && !modalIds.has(modalId)) return;
    setActiveModal(modalId);
  };

  return (
    <>
      <div className="animated-bg">
        <div className="bg-lines"></div>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
        {Array.from({ length: 10 }).map((_, index) => (
          <div className="particle" key={`particle-${index}`} />
        ))}
      </div>

      <header>
        <div className="container">
          <a href="#hero" className="header-logo" onClick={handleSmoothScroll}>
            <img src="/assets/images/logo.png" alt="NEXUS" />
            <span>NEXUS</span>
          </a>
          <button
            className="menu-toggle"
            id="menuToggle"
            aria-label="Открыть меню"
            onClick={() => setMenuOpen((prev) => !prev)}
            type="button"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <nav id="mainNav" className={menuOpen ? 'active' : ''}>
            <ul>
              {navLinks.map((link) => (
                <li key={link.section}>
                  <a
                    href={link.href}
                    className="nav-link"
                    data-section={link.section}
                    onClick={handleSmoothScroll}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <section className="hero" id="hero">
        <div className="container">
          <img
            src="/assets/images/logo.png"
            alt="NEXUS LOGO"
            className="hero-logo-img"
            data-aos="zoom-in"
          />
          <h1 data-aos="fade-down" data-aos-delay="200">
            Добро пожаловать в <span>NEXUS</span>
          </h1>
          <p className="subtitle" data-aos="fade-up" data-aos-delay="400">
            Твоя точка входа в мир большого киберспорта. Играй на железе профессионалов, побеждай
            с комфортом.
          </p>
          <button
            className="btn-style hero-btn"
            data-aos="fade-up"
            data-aos-delay="600"
            onClick={() => handleModalToggle('bookingModal')}
            type="button"
          >
            Забронировать ПК
          </button>
        </div>
      </section>

      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-box" data-aos="fade-up" data-aos-delay="100">
              <div className="stat-number" data-count="50">
                0
              </div>
              <div className="stat-label">Игровых мест</div>
            </div>
            <div className="stat-box" data-aos="fade-up" data-aos-delay="200">
              <div className="stat-number" data-count="10000">
                0
              </div>
              <div className="stat-label">Довольных игроков</div>
            </div>
            <div className="stat-box" data-aos="fade-up" data-aos-delay="300">
              <div className="stat-number" data-count="24">
                0
              </div>
              <div className="stat-label">Часа в сутки</div>
            </div>
            <div className="stat-box" data-aos="fade-up" data-aos-delay="400">
              <div className="stat-number" data-count="360">
                0
              </div>
              <div className="stat-label">Hz мониторы</div>
            </div>
          </div>
        </div>
      </section>

      <section className="specs" id="specs">
        <div className="container">
          <h2 className="section-title" data-aos="fade-up">
            Наш Арсенал
          </h2>
          <p className="section-subtitle" data-aos="fade-up" data-aos-delay="100">
            (Кликните, чтобы увидеть в действии)
          </p>
          <div className="specs-grid">
            <button
              className="spec-card-btn"
              data-aos="fade-up"
              data-aos-delay="200"
              onClick={() => handleModalToggle('videoModal1')}
              type="button"
            >
              <div className="spec-icon">⚡</div>
              <h3>RTX 4090 Power</h3>
              <p>Топовые видеокарты нового поколения. Максимальный FPS в любых играх на ультра настройках.</p>
            </button>
            <button
              className="spec-card-btn"
              data-aos="fade-up"
              data-aos-delay="300"
              onClick={() => handleModalToggle('videoModal2')}
              type="button"
            >
              <div className="spec-icon">📺</div>
              <h3>360Hz Мониторы</h3>
              <p>Невероятная плавность изображения для мгновенной реакции. Технология DyAc⁺.</p>
            </button>
            <button
              className="spec-card-btn"
              data-aos="fade-up"
              data-aos-delay="400"
              onClick={() => handleModalToggle('videoModal3')}
              type="button"
            >
              <div className="spec-icon">🎧</div>
              <h3>PRO Периферия</h3>
              <p>Сетап киберспортивного уровня. Logitech, HyperX, SteelSeries.</p>
            </button>
          </div>
        </div>
      </section>

      <section className="pricing" id="pricing">
        <div className="container">
          <h2 className="section-title" data-aos="fade-up">
            Тарифные планы
          </h2>
          <div className="price-grid">
            <div className="price-card" data-aos="fade-right" data-aos-delay="100">
              <h3>STANDART</h3>
              <div className="price">
                800 ₸ <span>/ час</span>
              </div>
              <ul>
                <li>RTX 3070 / 165Hz</li>
                <li>Общий зал</li>
                <li>Механическая клавиатура</li>
                <li>Gaming мышь</li>
                <li>Комфортное кресло</li>
              </ul>
              <button
                className="btn-style price-btn tooltip"
                onClick={() => handleModalToggle('bookingModal')}
                type="button"
              >
                <span className="tooltip-text">Нажми для брони</span>
                Выбрать
              </button>
            </div>
            <div className="price-card featured" data-aos="fade-up" data-aos-delay="200">
              <h3>NEXUS VIP</h3>
              <div className="price">
                1500 ₸ <span>/ час</span>
              </div>
              <ul>
                <li>RTX 4090 / 360Hz</li>
                <li>VIP-зона</li>
                <li>SecretLab кресло</li>
                <li>PRO периферия</li>
                <li>Приоритетная поддержка</li>
                <li>Напитки в подарок</li>
              </ul>
              <button
                className="btn-style price-btn tooltip"
                onClick={() => handleModalToggle('bookingModal')}
                type="button"
              >
                <span className="tooltip-text">Нажми для брони</span>
                Выбрать VIP
              </button>
            </div>
            <div className="price-card" data-aos="fade-left" data-aos-delay="300">
              <h3>BOOTCAMP</h3>
              <div className="price">
                6000 ₸ <span>/ час</span>
              </div>
              <ul>
                <li>Комната на 5 ПК</li>
                <li>Шумоизоляция</li>
                <li>Проектор для анализа</li>
                <li>Тренерская доска</li>
                <li>Отдельная зона отдыха</li>
              </ul>
              <button
                className="btn-style price-btn tooltip"
                onClick={() => handleModalToggle('bookingModal')}
                type="button"
              >
                <span className="tooltip-text">Нажми для брони</span>
                Арендовать
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="tournaments" id="tournaments">
        <div className="container">
          <h2 className="section-title" data-aos="fade-up">
            Турниры & Лиги
          </h2>
          <p className="section-subtitle" data-aos="fade-up" data-aos-delay="100">
            Еженедельные матчи, рейтинговые сезоны и LAN-финалы.
          </p>
          <div className="tournament-grid">
            <div className="tournament-card" data-aos="fade-up" data-aos-delay="150">
              <div className="tournament-meta">
                <span>CS 2</span>
                <span>Каждый четверг</span>
              </div>
              <div className="tournament-title">NEXUS Aim League</div>
              <div className="tournament-prize">Призовой фонд: 250 000 ₸</div>
              <div className="tournament-tags">
                <span className="tournament-tag">5v5</span>
                <span className="tournament-tag">LAN</span>
                <span className="tournament-tag">Ranked</span>
              </div>
            </div>
            <div className="tournament-card" data-aos="fade-up" data-aos-delay="250">
              <div className="tournament-meta">
                <span>Dota 2</span>
                <span>Суббота</span>
              </div>
              <div className="tournament-title">Ancients Clash Cup</div>
              <div className="tournament-prize">Призовой фонд: 300 000 ₸</div>
              <div className="tournament-tags">
                <span className="tournament-tag">5v5</span>
                <span className="tournament-tag">Best of 3</span>
                <span className="tournament-tag">Pro Draft</span>
              </div>
            </div>
            <div className="tournament-card" data-aos="fade-up" data-aos-delay="350">
              <div className="tournament-meta">
                <span>Valorant</span>
                <span>Пятница</span>
              </div>
              <div className="tournament-title">Protocol Open Series</div>
              <div className="tournament-prize">Призовой фонд: 200 000 ₸</div>
              <div className="tournament-tags">
                <span className="tournament-tag">5v5</span>
                <span className="tournament-tag">Double Elim</span>
                <span className="tournament-tag">Streamed</span>
              </div>
            </div>
            <div className="tournament-card" data-aos="fade-up" data-aos-delay="450">
              <div className="tournament-meta">
                <span>Battle Royale</span>
                <span>Раз в месяц</span>
              </div>
              <div className="tournament-title">NEXUS Legends Night</div>
              <div className="tournament-prize">Призовой фонд: 150 000 ₸</div>
              <div className="tournament-tags">
                <span className="tournament-tag">Trios</span>
                <span className="tournament-tag">Showmatch</span>
                <span className="tournament-tag">Cashback</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="schedule" id="schedule">
        <div className="container">
          <h2 className="section-title" data-aos="fade-up">
            Расписание & Загруженность
          </h2>
          <p className="section-subtitle" data-aos="fade-up" data-aos-delay="100">
            Отследи свободные слоты и забронируй лучшее время.
          </p>
          <div className="schedule-grid">
            <div className="schedule-card" data-aos="fade-right" data-aos-delay="150">
              <h3>Ближайшие события</h3>
              <ul className="schedule-list">
                <li className="schedule-item">
                  <span>Сегодня, 19:00</span>
                  <span>CS 2 Scrim</span>
                </li>
                <li className="schedule-item">
                  <span>Завтра, 18:30</span>
                  <span>Valorant Practice</span>
                </li>
                <li className="schedule-item">
                  <span>Сб, 16:00</span>
                  <span>Dota 2 Cup</span>
                </li>
                <li className="schedule-item">
                  <span>Вс, 20:00</span>
                  <span>Showmatch Night</span>
                </li>
              </ul>
              <div className="schedule-cta">
                <button className="btn-style" onClick={() => handleModalToggle('bookingModal')} type="button">
                  Бронь по событию
                </button>
              </div>
            </div>
            <div className="schedule-card" data-aos="fade-up" data-aos-delay="250">
              <h3>Загруженность залов</h3>
              <div className="occupancy-list">
                {occupancyValues.map((item) => (
                  <div className="occupancy-row" key={item.label}>
                    <span>{item.label}</span>
                    <div className="occupancy-bar">
                      <span data-occupancy={item.value}></span>
                    </div>
                    <strong>{item.value}%</strong>
                  </div>
                ))}
              </div>
            </div>
            <div className="schedule-card" data-aos="fade-left" data-aos-delay="350">
              <h3>Часы работы</h3>
              <ul className="schedule-list">
                <li className="schedule-item">
                  <span>Пн - Чт</span>
                  <span>10:00 - 02:00</span>
                </li>
                <li className="schedule-item">
                  <span>Пт</span>
                  <span>10:00 - 04:00</span>
                </li>
                <li className="schedule-item">
                  <span>Сб</span>
                  <span>24 часа</span>
                </li>
                <li className="schedule-item">
                  <span>Вс</span>
                  <span>10:00 - 02:00</span>
                </li>
              </ul>
              <div className="schedule-cta">
                <button className="btn-style" onClick={() => handleModalToggle('bookingModal')} type="button">
                  Быстрая бронь
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="games" id="games">
        <div className="container">
          <h2 className="section-title" data-aos="fade-up">
            Во что играем
          </h2>
          <p className="section-subtitle" data-aos="fade-up" data-aos-delay="100">
            Все популярные киберспортивные дисциплины
          </p>
          <div className="games-grid">
            <button className="game-btn g-cs2" data-aos="zoom-in" data-aos-delay="100" onClick={() => handleModalToggle('gameModal1')} type="button">
              CS 2
            </button>
            <button className="game-btn g-dota" data-aos="zoom-in" data-aos-delay="200" onClick={() => handleModalToggle('gameModal2')} type="button">
              Dota 2
            </button>
            <button className="game-btn g-val" data-aos="zoom-in" data-aos-delay="300" onClick={() => handleModalToggle('gameModal3')} type="button">
              Valorant
            </button>
            <button className="game-btn g-apex" data-aos="zoom-in" data-aos-delay="400" onClick={() => handleModalToggle('gameModal4')} type="button">
              Apex Legends
            </button>
            <button className="game-btn g-fort" data-aos="zoom-in" data-aos-delay="500" onClick={() => handleModalToggle('gameModal5')} type="button">
              Fortnite
            </button>
            <button className="game-btn g-warz" data-aos="zoom-in" data-aos-delay="600" onClick={() => handleModalToggle('gameModal6')} type="button">
              Warzone
            </button>
          </div>
        </div>
      </section>

      <footer id="contact">
        <div className="container">
          <div className="footer-content" data-aos="fade-up">
            <div className="footer-section">
              <div className="footer-logo">
                <img src="/assets/images/logo.png" alt="NEXUS" />
              </div>
              <p style={{ textAlign: 'center' }}>Киберспортивная арена нового поколения</p>
            </div>

            <div className="footer-section">
              <h3>Навигация</h3>
              <a href="#specs" onClick={handleSmoothScroll}>
                Железо
              </a>
              <a href="#pricing" onClick={handleSmoothScroll}>
                Тарифы
              </a>
              <a href="#tournaments" onClick={handleSmoothScroll}>
                Турниры
              </a>
              <a href="#schedule" onClick={handleSmoothScroll}>
                Расписание
              </a>
              <a href="#games" onClick={handleSmoothScroll}>
                Игры
              </a>
            </div>

            <div className="footer-section">
              <h3>Контакты</h3>
              <p>📍 г. Астана, ул. Киберспортивная, д. 13</p>
              <p>📞 +7 (777) 000-00-00</p>
              <p>✉️ info@nexus-esports.kz</p>
              <p>🕐 Круглосуточно, 24/7</p>
            </div>

            <div className="footer-section">
              <h3>График работы</h3>
              <p>Понедельник - Пятница: 24/7</p>
              <p>Суббота - Воскресенье: 24/7</p>
              <p>Турниры: по расписанию</p>
            </div>
          </div>

          <div className="social-icons" data-aos="fade-up" data-aos-delay="100">
            <a href="#" title="Facebook">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3 8h-1.35c-.538 0-.65.221-.65.778v1.222h2l-.209 2h-1.791v7h-3v-7h-2v-2h2v-2.308c0-1.769.931-2.692 3.029-2.692h1.971v3z" />
              </svg>
            </a>
            <a href="#" title="Instagram">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a href="#" title="Telegram">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
              </svg>
            </a>
            <a href="#" title="Discord">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm-2.5 8.5c-.828 0-1.5.895-1.5 2s.672 2 1.5 2 1.5-.895 1.5-2-.672-2-1.5-2zm5 0c-.828 0-1.5.895-1.5 2s.672 2 1.5 2 1.5-.895 1.5-2-.672-2-1.5-2zm-6.5 7c0 1.5 3.5 2 4 2s4-.5 4-2h-8z" />
              </svg>
            </a>
            <a href="#" title="VK">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6.344 16.163h-1.867c-.562 0-.73-.458-1.732-1.479-.875-.906-1.261-1.027-1.482-1.027-.301 0-.385.084-.385.493v1.354c0 .364-.115.583-1.075.583-1.591 0-3.349-0.967-4.588-2.769-1.851-2.675-2.365-4.688-2.365-5.096 0-.219.084-.423.493-.423h1.867c.367 0 .507.168.65.561.718 2.099 1.926 3.937 2.424 3.937.188 0 .272-.085.272-.554v-2.177c-.062-.991-.582-1.076-.582-1.429 0-.175.146-.346.383-.346h2.933c.311 0 .425.164.425.519v2.895c0 .311.141.424.229.424.188 0 .346-.113.696-.463 1.069-1.202 1.835-3.059 1.835-3.059.103-.219.272-.423.642-.423h1.867c.558 0 .681.287.558.677-.229.967-2.474 4.191-2.474 4.191-.159.261-.219.376 0 .672.159.219.681.667 1.034 1.073.65.744 1.149 1.367 1.281 1.802.135.438-.067.659-.505.659z" />
              </svg>
            </a>
          </div>

          <p className="copyright">© 2025 NEXUS eSports. Все права защищены.</p>
        </div>
      </footer>

      <div
        id="bookingModal"
        className={`modal${activeModal === 'bookingModal' ? ' show' : ''}`}
        onClick={(event) => {
          if (event.target === event.currentTarget) handleModalToggle(null);
        }}
      >
        <div className="modal-content">
          <button className="close" onClick={() => handleModalToggle(null)} type="button">
            &times;
          </button>
          <h2>Бронирование</h2>
          <p>Оставьте заявку, и мы свяжемся для подтверждения.</p>
          <form ref={formRef} id="bookingForm" onSubmit={handleFormSubmit}>
            <input type="text" className="modal-input" placeholder="Ваше Имя" required />
            <input
              type="tel"
              className="modal-input"
              placeholder="Ваш Телефон"
              required
              pattern="[0-9]{10,}"
              title="Введите корректный номер телефона"
            />
            <input type="email" className="modal-input" placeholder="Ваш Email (опционально)" />
            <select className="modal-input" required>
              <option value="">Выберите тариф</option>
              <option>Тариф STANDART</option>
              <option>Тариф VIP</option>
              <option>BOOTCAMP</option>
            </select>
            <input type="datetime-local" className="modal-input" required />
            <button type="submit" className="btn-style modal-btn">
              Отправить заявку
            </button>
          </form>
        </div>
      </div>

      <div
        id="videoModal1"
        className={`modal${activeModal === 'videoModal1' ? ' show' : ''}`}
        onClick={(event) => {
          if (event.target === event.currentTarget) handleModalToggle(null);
        }}
      >
        <div className="modal-content">
          <button className="close" onClick={() => handleModalToggle(null)} type="button">
            &times;
          </button>
          <h2>NVIDIA RTX 4090 Beast</h2>
          <video className="spec-modal-video" autoPlay loop muted playsInline>
            <source src="/assets/videos/vid1.mp4" type="video/mp4" />
          </video>
          <div className="spec-modal-desc">
            <p>
              Абсолютная мощь. Никаких компромиссов. Видеокарта нового поколения с архитектурой Ada
              Lovelace обеспечивает беспрецедентную производительность.
            </p>
            <ul>
              <li>4K Гейминг на Ультра настройках</li>
              <li>Стабильные 500+ FPS в CS2</li>
              <li>Ray Tracing в реальном времени</li>
              <li>DLSS 3.0 для максимальной плавности</li>
            </ul>
          </div>
        </div>
      </div>

      <div
        id="videoModal2"
        className={`modal${activeModal === 'videoModal2' ? ' show' : ''}`}
        onClick={(event) => {
          if (event.target === event.currentTarget) handleModalToggle(null);
        }}
      >
        <div className="modal-content">
          <button className="close" onClick={() => handleModalToggle(null)} type="button">
            &times;
          </button>
          <h2>ZOWIE 360Hz DyAc⁺</h2>
          <video className="spec-modal-video" autoPlay loop muted playsInline>
            <source src="/assets/videos/vid2.mp4" type="video/mp4" />
          </video>
          <div className="spec-modal-desc">
            <p>
              Секретное оружие профессиональных снайперов. Картинка настолько плавная, что ты видишь
              каждый кадр движения противника.
            </p>
            <ul>
              <li>Частота обновления 360 Гц</li>
              <li>Технология DyAc⁺ для четкости</li>
              <li>Время отклика 0.5 мс</li>
              <li>Используется на турнирах Tier-1</li>
            </ul>
          </div>
        </div>
      </div>

      <div
        id="videoModal3"
        className={`modal${activeModal === 'videoModal3' ? ' show' : ''}`}
        onClick={(event) => {
          if (event.target === event.currentTarget) handleModalToggle(null);
        }}
      >
        <div className="modal-content">
          <button className="close" onClick={() => handleModalToggle(null)} type="button">
            &times;
          </button>
          <h2>PRO Setup RGB</h2>
          <video className="spec-modal-video" autoPlay loop muted playsInline>
            <source src="/assets/videos/vid3.mp4" type="video/mp4" />
          </video>
          <div className="spec-modal-desc">
            <p>
              Топовые беспроводные мыши Logitech G Pro X Superlight и механические клавиатуры на
              красных свитчах Cherry MX. Идеальный контроль и тактильный отклик.
            </p>
            <ul>
              <li>Logitech G Pro X Superlight</li>
              <li>Cherry MX Red механика</li>
              <li>HyperX Cloud Alpha наушники</li>
              <li>RGB подсветка с синхронизацией</li>
            </ul>
          </div>
        </div>
      </div>

      {[
        {
          id: 'gameModal1',
          title: 'CS 2: Операция Nexus',
          className: 'gm-cs2',
          stats: [
            { label: 'Средний FPS', value: '540' },
            { label: 'Пинг LAN', value: '1ms' },
            { label: 'Tick Rate', value: '128' }
          ],
          description:
            '"Идеальная площадка для твоих клатчей. Регистрирует каждый выстрел. Никаких оправданий - только чистый скилл."',
          cta: 'Занять слот'
        },
        {
          id: 'gameModal2',
          title: 'Dota 2: Битва Древних',
          className: 'gm-dota',
          stats: [
            { label: 'FPS', value: '300+' },
            { label: 'Пинг', value: '5ms' }
          ],
          description:
            '"Никаких лагов даже при касте Блэкхола с полным стадионом юнитов. Твои teamfight\'ы станут идеальными."',
          cta: 'Занять слот'
        },
        {
          id: 'gameModal3',
          title: 'Valorant: Протокол',
          className: 'gm-val',
          stats: [
            { label: 'FPS', value: '600+' },
            { label: 'Реакция', value: '0.5ms' }
          ],
          description:
            '"Точность стрельбы выходит на новый уровень. Peek преимущество гарантировано."',
          cta: 'Занять слот'
        },
        {
          id: 'gameModal4',
          title: 'Apex Legends',
          className: 'gm-apex',
          stats: [{ label: 'FPS Ultra', value: '240+' }],
          description:
            '"Динамичные бои без просадок FPS. Все твои слайды и валлджампы будут четкими."',
          cta: 'В бой'
        },
        {
          id: 'gameModal5',
          title: 'Fortnite',
          className: 'gm-fort',
          stats: [{ label: 'FPS Perf.', value: '400+' }],
          description:
            '"Стройся и стреляй без задержек. Билдинг на максимальной скорости."',
          cta: 'В бой'
        },
        {
          id: 'gameModal6',
          title: 'Call of Duty: Warzone',
          className: 'gm-warz',
          stats: [{ label: 'FPS 2K', value: '180+' }],
          description:
            '"Верданск ждет. Королевская битва в 2K разрешении с высоким FPS."',
          cta: 'В бой'
        }
      ].map((modal) => (
        <div
          key={modal.id}
          id={modal.id}
          className={`modal${activeModal === modal.id ? ' show' : ''}`}
          onClick={(event) => {
            if (event.target === event.currentTarget) handleModalToggle(null);
          }}
        >
          <div className="modal-content game-modal-content">
            <div className={`game-dossier ${modal.className}`}>
              <div className="game-dossier-overlay">
                <button className="close" onClick={() => handleModalToggle(null)} type="button">
                  &times;
                </button>
                <h2>{modal.title}</h2>
                <div className="game-stats-grid">
                  {modal.stats.map((stat) => (
                    <div className="stat-item" key={stat.label}>
                      <h4>{stat.label}</h4>
                      <div className="stat-val">{stat.value}</div>
                    </div>
                  ))}
                </div>
                <p className="game-desc-text">{modal.description}</p>
                <button className="btn-style modal-btn" onClick={() => handleModalToggle('bookingModal')} type="button">
                  {modal.cta}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        className="scroll-top"
        id="scrollTop"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        type="button"
      >
        ↑
      </button>
    </>
  );
}
