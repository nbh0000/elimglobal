/* (주)엘림글로벌 테마 스크립트 (의존성 없음) */
(function () {
	'use strict';

	var $ = function (sel, root) { return (root || document).querySelector(sel); };
	var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

	/* 모바일 메뉴 */
	var menuBtn = $('[data-menu-btn]');
	var gnb = $('[data-gnb]');
	if (menuBtn && gnb) {
		menuBtn.addEventListener('click', function () {
			var open = !gnb.classList.contains('is-open');
			gnb.classList.toggle('is-open', open);
			document.body.classList.toggle('menu-open', open);
			menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
		});
		$$('.gnb__toggle', gnb).forEach(function (btn) {
			btn.addEventListener('click', function () {
				var li = btn.parentElement;
				var open = !li.classList.contains('is-open');
				li.classList.toggle('is-open', open);
				btn.setAttribute('aria-expanded', open ? 'true' : 'false');
			});
		});
	}

	/* 캡슐 헤더: 스크롤하면 배경을 더 불투명하게 */
	var hd = $('[data-hd]');
	if (hd && hd.classList.contains('hd--capsule')) {
		var onScroll = function () { hd.classList.toggle('is-scrolled', window.scrollY > 40); };
		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();
	}

	/* 메인: 화면에 들어올 때 부드럽게 나타나기 */
	var reveals = $$('[data-reveal]');
	if (reveals.length) {
		if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			document.documentElement.classList.add('js-reveal');
			var rio = new IntersectionObserver(function (entries) {
				entries.forEach(function (e) {
					if (e.isIntersecting) { e.target.classList.add('is-in'); rio.unobserve(e.target); }
				});
			}, { rootMargin: '0px 0px -8% 0px' });
			reveals.forEach(function (el) { rio.observe(el); });
		}
	}

	/* 제품 슬라이드 */
	$$('[data-slider]').forEach(function (slider) {
		var track = $('[data-track]', slider);
		var sec = slider.closest('section') || document;
		var prev = $('[data-slide=prev]', sec);
		var next = $('[data-slide=next]', sec);
		if (!track || !prev || !next) return;
		function step() {
			var item = track.firstElementChild;
			return item ? item.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0) : track.clientWidth;
		}
		function update() {
			var max = track.scrollWidth - track.clientWidth - 2;
			prev.disabled = track.scrollLeft <= 2;
			next.disabled = track.scrollLeft >= max;
			var hide = track.scrollWidth <= track.clientWidth + 2;
			prev.hidden = next.hidden = hide;
		}
		prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
		next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
		track.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });
		window.addEventListener('resize', update);
		update();
	});

	/* 유튜브: 누를 때 영상 불러오기 */
	$$('[data-yt]').forEach(function (box) {
		var btn = $('.yt__btn', box);
		if (!btn) return;
		btn.addEventListener('click', function () {
			var iframe = document.createElement('iframe');
			iframe.src = 'https://www.youtube-nocookie.com/embed/' + box.getAttribute('data-yt') + '?autoplay=1&rel=0';
			iframe.title = btn.getAttribute('aria-label') || 'YouTube';
			iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
			iframe.allowFullscreen = true;
			box.replaceChild(iframe, btn);
		});
	});

	/* 제품 이미지 썸네일 */
	$$('[data-gallery]').forEach(function (g) {
		var main = $('[data-gallery-main]', g);
		if (!main) return;
		$$('.pd__thumbs button', g).forEach(function (btn) {
			btn.addEventListener('click', function () {
				main.removeAttribute('srcset');
				main.src = btn.getAttribute('data-full');
				$$('.pd__thumbs button', g).forEach(function (b) { b.removeAttribute('aria-current'); });
				btn.setAttribute('aria-current', 'true');
			});
		});
	});

	/* 모바일: 제품 상세에서 견적 버튼이 화면 밖으로 나가면 하단 고정 버튼 표시 */
	var sticky = $('[data-sticky-cta]');
	var actions = $('.pd__actions');
	if (sticky && actions && 'IntersectionObserver' in window) {
		new IntersectionObserver(function (entries) {
			var e = entries[0];
			sticky.classList.toggle('is-on', !e.isIntersecting && e.boundingClientRect.top < 0);
		}).observe(actions);
	}

	/* 견적문의: 제품을 고르면 제목에 제품명 자동 입력 */
	var select = $('[data-product-select]');
	var subject = $('[data-subject]');
	if (select && subject) {
		var auto = function (name) { return '[견적문의] ' + name; };
		select.addEventListener('change', function () {
			var opt = select.options[select.selectedIndex];
			var isAuto = subject.value === '' || /^\[견적문의\] /.test(subject.value);
			if (isAuto) subject.value = select.value ? auto(opt.text) : '';
		});
	}

	/* 견적문의: 제출 전 필수값 확인 */
	$$('form[data-validate]').forEach(function (form) {
		form.addEventListener('submit', function (ev) {
			var first = null;
			$$('.field__err', form).forEach(function (el) { el.remove(); });
			$$('.is-invalid', form).forEach(function (el) { el.classList.remove('is-invalid'); });
			$$('[required]', form).forEach(function (input) {
				var ok = input.type === 'checkbox' ? input.checked : input.value.trim() !== '' && input.checkValidity();
				if (ok) return;
				var field = input.closest('.field') || input.parentElement;
				field.classList.add('is-invalid');
				var msg = document.createElement('p');
				msg.className = 'field__err';
				msg.textContent = input.type === 'checkbox' ? '동의가 필요합니다.' : (input.value.trim() === '' ? '필수 입력 항목입니다.' : '형식을 확인해 주십시오.');
				field.appendChild(msg);
				if (!first) first = input;
			});
			if (first) {
				ev.preventDefault();
				first.focus();
			} else {
				var btn = form.querySelector('[type=submit]');
				if (btn) { btn.disabled = true; btn.textContent = '전송 중…'; }
			}
		});
	});

	/* 자료실 목차: 현재 읽는 위치 표시 */
	var tocLinks = $$('.toc a');
	if (tocLinks.length && 'IntersectionObserver' in window) {
		var map = {};
		tocLinks.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (e) {
				if (!e.isIntersecting) return;
				tocLinks.forEach(function (a) { a.classList.remove('is-active'); });
				if (map[e.target.id]) map[e.target.id].classList.add('is-active');
			});
		}, { rootMargin: '-20% 0px -70% 0px' });
		Object.keys(map).forEach(function (id) {
			var el = document.getElementById(id);
			if (el) io.observe(el);
		});
	}
})();
