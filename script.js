/**
 * DuskCube Architects — Main JavaScript
 * Handles: loader, scroll animations, header, mobile nav, cursor, form, project routing
 */

document.addEventListener('DOMContentLoaded', () => {

  // ===== LOADER (only on fresh open / refresh, not internal nav) =====
  const loader = document.getElementById('loader');
  if (loader) {
    if (sessionStorage.getItem('internalNav')) {
      // Internal page switch — skip loader entirely
      loader.classList.add('hidden');
      sessionStorage.removeItem('internalNav');
    } else {
      // Fresh open or refresh — show loader
      if (document.readyState === 'complete') {
        setTimeout(() => { loader.classList.add('hidden'); }, 800);
      } else {
        window.addEventListener('load', () => {
          setTimeout(() => { loader.classList.add('hidden'); }, 800);
        });
      }
      // Fallback: hide loader after 3s max
      setTimeout(() => { loader.classList.add('hidden'); }, 3000);
    }
  }

  // Mark all internal links so they skip the loader on the next page
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:')) {
      link.addEventListener('click', () => {
        sessionStorage.setItem('internalNav', 'true');
      });
    }
  });

  // ===== HEADER SCROLL + LIQUID GLASS =====
  const header = document.getElementById('header');
  if (header) {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      if (currentScroll > 60) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      lastScroll = currentScroll;
    }, { passive: true });

    // Liquid Glass - Mouse tracking on header
    header.addEventListener('mousemove', (e) => {
      const rect = header.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      header.style.setProperty('--mouse-x', x + '%');
      header.style.setProperty('--mouse-y', y + '%');
    });

    header.addEventListener('mouseleave', () => {
      header.style.setProperty('--mouse-x', '50%');
      header.style.setProperty('--mouse-y', '50%');
    });
  }

  // ===== PAGE FADE-IN (for internal nav) =====
  const isInternalNav = sessionStorage.getItem('internalNav');
  if (isInternalNav) {
    document.body.classList.add('page-entering');
  }

  // ===== NAV SLIDER (Sliding Active Indicator) =====
  const headerNav = document.querySelector('.header-nav');
  const navSlider = document.querySelector('.nav-slider');
  if (headerNav && navSlider) {
    const navLinks = headerNav.querySelectorAll('a');
    const activeLink = headerNav.querySelector('a.active');

    // Position slider on the given element
    function positionSlider(el) {
      if (!el) { navSlider.style.opacity = '0'; return; }
      const navRect = headerNav.getBoundingClientRect();
      const linkRect = el.getBoundingClientRect();
      navSlider.style.left = (linkRect.left - navRect.left) + 'px';
      navSlider.style.width = linkRect.width + 'px';
      navSlider.style.opacity = '1';
    }

    // Check if arriving from an internal nav click
    const sliderFrom = sessionStorage.getItem('navSliderFrom');
    const sliderFromWidth = sessionStorage.getItem('navSliderFromWidth');
    sessionStorage.removeItem('navSliderFrom');
    sessionStorage.removeItem('navSliderFromWidth');

    if (sliderFrom !== null && activeLink) {
      // Start at the OLD tab position instantly, then slide to the new active
      navSlider.style.transition = 'none';
      navSlider.style.left = sliderFrom + 'px';
      navSlider.style.width = (sliderFromWidth || '80') + 'px';
      navSlider.style.opacity = '1';
      navSlider.offsetHeight; // force reflow
      navSlider.style.transition = '';
      // Small delay so the page is painted before sliding
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          positionSlider(activeLink);
          // Fade page in simultaneously
          document.body.classList.remove('page-entering');
          document.body.classList.add('page-visible');
        });
      });
    } else {
      // First load / refresh — place slider instantly, no animation
      navSlider.style.transition = 'none';
      positionSlider(activeLink);
      navSlider.offsetHeight;
      navSlider.style.transition = '';
      document.body.classList.remove('page-entering');
      document.body.classList.add('page-visible');
    }

    // On link click — store position and navigate immediately (no delay)
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (link.classList.contains('active')) return;

        e.preventDefault();

        // Store current active slider position for the destination page
        const navRect = headerNav.getBoundingClientRect();
        const currentRect = activeLink ? activeLink.getBoundingClientRect() : null;
        if (currentRect) {
          sessionStorage.setItem('navSliderFrom', (currentRect.left - navRect.left).toString());
          sessionStorage.setItem('navSliderFromWidth', currentRect.width.toString());
        }

        // Navigate immediately — the new page will handle the slide animation
        window.location.href = href;
      });
    });

    // Re-position on resize
    window.addEventListener('resize', () => positionSlider(activeLink));
  } else {
    // No nav slider (e.g. project page) — still fade in
    document.body.classList.remove('page-entering');
    document.body.classList.add('page-visible');
  }

  // ===== MOBILE NAV =====
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      mobileNav.classList.toggle('active');
      document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
    });
    // Close mobile nav on link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // ===== CUSTOM CURSOR =====
  const cursor = document.getElementById('cursor');
  if (cursor && window.innerWidth > 768) {
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });
    // Enlarge cursor on interactive elements
    const interactives = document.querySelectorAll('a, button, .work-card, .project-card, .news-card, input, textarea, select');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('active'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
    });
  }

  // ===== SCROLL REVEAL ANIMATIONS =====
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // ===== CONTACT FORM (Web3Forms) =====
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn = contactForm.querySelector('.btn-submit');
      const originalText = btn.textContent;
      btn.textContent = 'Sending...';
      btn.disabled = true;

      try {
        const formData = new FormData(contactForm);
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData
        });
        const result = await response.json();

        if (result.success) {
          btn.textContent = 'Message Sent ✓';
          btn.style.background = '#2a9d8f';
          contactForm.reset();
        } else {
          btn.textContent = 'Failed — Try Again';
          btn.style.background = '#e74c3c';
        }
      } catch (error) {
        btn.textContent = 'Error — Try Again';
        btn.style.background = '#e74c3c';
      }

      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.disabled = false;
      }, 3000);
    });
  }

  // ===== PROJECT DETAIL ROUTING =====
  // Dynamically update project details based on URL parameter
  if (window.location.pathname.includes('project.html')) {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id');

    const projects = {
      'vertex': {
        label: '02 / Cultural',
        title: 'Vertex <span class="highlight">Museum</span>',
        location: 'Berlin, Germany',
        year: '2024',
        type: 'Cultural',
        area: '3,200 m²',
        status: 'Completed',
        heroImage: 'https://images.unsplash.com/photo-1545558014-8692077e8b5c?w=1600&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1486718448742-163732cd1544?w=800&q=80',
          'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80',
          'https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a?w=800&q=80',
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'
        ],
        prev: 'project.html',
        next: 'project.html?id=echo'
      },
      'echo': {
        label: '03 / Installation',
        title: 'Echo <span class="highlight">Pavilion</span>',
        location: 'Venice, Italy',
        year: '2024',
        type: 'Installation',
        area: '180 m²',
        status: 'Completed',
        heroImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1574958269340-fa927503f3dd?w=800&q=80',
          'https://images.unsplash.com/photo-1541123603104-512919d6a96c?w=800&q=80',
          'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80',
          'https://images.unsplash.com/photo-1486718448742-163732cd1544?w=800&q=80'
        ],
        prev: 'project.html?id=vertex',
        next: 'project.html?id=kyoto'
      },
      'kyoto': {
        label: '04 / Commercial',
        title: 'Kyoto <span class="highlight">HQ</span>',
        location: 'Kyoto, Japan',
        year: '2023',
        type: 'Commercial',
        area: '8,500 m²',
        status: 'Completed',
        heroImage: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a?w=800&q=80',
          'https://images.unsplash.com/photo-1431576901776-e539bd916ba2?w=800&q=80',
          'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=800&q=80',
          'https://images.unsplash.com/photo-1494526585095-c41746248156?w=800&q=80'
        ],
        prev: 'project.html?id=echo',
        next: 'project.html?id=terra'
      },
      'terra': {
        label: '05 / Residential',
        title: 'Terra <span class="highlight">Residence</span>',
        location: 'Lisbon, Portugal',
        year: '2023',
        type: 'Residential',
        area: '620 m²',
        status: 'Completed',
        heroImage: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=1600&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
          'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&q=80'
        ],
        prev: 'project.html?id=kyoto',
        next: 'project.html?id=prism'
      },
      'prism': {
        label: '06 / Cultural',
        title: 'Prism <span class="highlight">Gallery</span>',
        location: 'New York, USA',
        year: '2023',
        type: 'Cultural',
        area: '1,400 m²',
        status: 'Completed',
        heroImage: 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=1600&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1486718448742-163732cd1544?w=800&q=80',
          'https://images.unsplash.com/photo-1545558014-8692077e8b5c?w=800&q=80',
          'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80',
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'
        ],
        prev: 'project.html?id=terra',
        next: 'project.html?id=mono'
      },
      'mono': {
        label: '07 / Commercial',
        title: 'Monolith <span class="highlight">Tower</span>',
        location: 'Dubai, UAE',
        year: '2022',
        type: 'Commercial',
        area: '22,000 m²',
        status: 'Completed',
        heroImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=800&q=80',
          'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
          'https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a?w=800&q=80',
          'https://images.unsplash.com/photo-1431576901776-e539bd916ba2?w=800&q=80'
        ],
        prev: 'project.html?id=prism',
        next: 'project.html?id=shadow'
      },
      'shadow': {
        label: '08 / Residential',
        title: 'Shadow <span class="highlight">House</span>',
        location: 'Copenhagen, Denmark',
        year: '2022',
        type: 'Residential',
        area: '340 m²',
        status: 'Completed',
        heroImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
          'https://images.unsplash.com/photo-1494526585095-c41746248156?w=800&q=80',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
          'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&q=80'
        ],
        prev: 'project.html?id=mono',
        next: 'project.html'
      }
    };

    if (projectId && projects[projectId]) {
      const p = projects[projectId];

      // Update label
      const labelEl = document.getElementById('projectLabel');
      if (labelEl) labelEl.textContent = p.label;

      // Update title
      const titleEl = document.getElementById('projectTitle');
      if (titleEl) titleEl.innerHTML = p.title;

      // Update meta
      const metaEl = document.getElementById('projectMeta');
      if (metaEl) {
        metaEl.innerHTML = `
          <div class="project-detail-meta-item"><span>Location</span><span>${p.location}</span></div>
          <div class="project-detail-meta-item"><span>Year</span><span>${p.year}</span></div>
          <div class="project-detail-meta-item"><span>Type</span><span>${p.type}</span></div>
          <div class="project-detail-meta-item"><span>Area</span><span>${p.area}</span></div>
          <div class="project-detail-meta-item"><span>Status</span><span>${p.status}</span></div>
        `;
      }

      // Update hero image
      const heroImgEl = document.getElementById('projectHeroImage');
      if (heroImgEl) {
        heroImgEl.querySelector('img').src = p.heroImage;
      }

      // Update gallery
      const galleryEl = document.getElementById('projectGallery');
      if (galleryEl) {
        galleryEl.innerHTML = p.gallery.map(src => `<img src="${src}" alt="Project image">`).join('');
      }

      // Update navigation links
      const navEl = document.querySelector('.project-detail-nav');
      if (navEl) {
        navEl.innerHTML = `
          <a href="${p.prev}">&larr; Previous Project</a>
          <a href="work.html">All Projects</a>
          <a href="${p.next}">Next Project &rarr;</a>
        `;
      }

      // Update page title
      document.title = `${p.title.replace(/<[^>]*>/g, '')} — DuskCube Architects`;
    }
  }

  // ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ===== PARALLAX EFFECT ON HERO =====
  const heroBg = document.querySelector('.hero-bg-image');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      if (scrolled < window.innerHeight) {
        heroBg.style.transform = `translateY(${scrolled * 0.3}px)`;
      }
    }, { passive: true });
  }

  // ===== MARQUEE PAUSE ON HOVER =====
  const marqueeTrack = document.querySelector('.marquee-track');
  if (marqueeTrack) {
    marqueeTrack.addEventListener('mouseenter', () => {
      marqueeTrack.style.animationPlayState = 'paused';
    });
    marqueeTrack.addEventListener('mouseleave', () => {
      marqueeTrack.style.animationPlayState = 'running';
    });
  }

});
