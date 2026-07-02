/**
 * pos-common.js
 * Smart New Retail Cloud POS - Common Script
 * For all non-login, non-cashier pages
 */

(function () {
    'use strict';

    /* ============================================================
     *  1. Toast Component
     * ============================================================ */
    function showToast(msg, type) {
        type = type || 'info';
        var container = document.getElementById('toast-container') || createToastContainer();

        var iconMap = {
            success: 'fa-check-circle',
            info:    'fa-info-circle',
            warning: 'fa-exclamation-triangle',
            error:   'fa-times-circle'
        };

        var colorMap = {
            success: '#52c41a',
            info:    '#1890ff',
            warning: '#faad14',
            error:   '#ff4d4f'
        };

        var toast = document.createElement('div');
        toast.className = 'pos-toast pos-toast--' + type;
        toast.innerHTML =
            '<i class="fa ' + (iconMap[type] || iconMap.info) + '"></i>' +
            '<span>' + msg + '</span>';
        toast.style.borderLeftColor = colorMap[type] || colorMap.info;

        container.appendChild(toast);

        // trigger reflow for animation
        void toast.offsetWidth;
        toast.classList.add('pos-toast--visible');

        setTimeout(function () {
            toast.classList.remove('pos-toast--visible');
            toast.addEventListener('transitionend', function () {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            });
            // fallback removal
            setTimeout(function () {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 400);
        }, 2500);
    }

    function createToastContainer() {
        var container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText =
            'position:fixed;top:24px;right:24px;z-index:99999;' +
            'display:flex;flex-direction:column;gap:10px;pointer-events:none;';
        document.body.appendChild(container);
        return container;
    }

    function injectToastStyles() {
        if (document.getElementById('pos-toast-style')) return;
        var style = document.createElement('style');
        style.id = 'pos-toast-style';
        style.textContent =
            '.pos-toast{' +
            '  display:flex;align-items:center;gap:8px;' +
            '  padding:12px 20px;border-radius:6px;' +
            '  background:#fff;color:#333;font-size:14px;' +
            '  box-shadow:0 4px 16px rgba(0,0,0,.15);' +
            '  border-left:4px solid #1890ff;' +
            '  transform:translateX(120%);opacity:0;' +
            '  transition:transform .35s ease,opacity .35s ease;' +
            '  pointer-events:auto;white-space:nowrap;' +
            '}' +
            '.pos-toast--visible{' +
            '  transform:translateX(0);opacity:1;' +
            '}' +
            '.pos-toast i{' +
            '  font-size:16px;color:inherit;' +
            '}' +
            '.pos-toast--success{border-left-color:#52c41a}' +
            '.pos-toast--success i{color:#52c41a}' +
            '.pos-toast--info{border-left-color:#1890ff}' +
            '.pos-toast--info i{color:#1890ff}' +
            '.pos-toast--warning{border-left-color:#faad14}' +
            '.pos-toast--warning i{color:#faad14}' +
            '.pos-toast--error{border-left-color:#ff4d4f}' +
            '.pos-toast--error i{color:#ff4d4f}';
        document.head.appendChild(style);
    }

    /* ============================================================
     *  2. Sidebar Menu Collapse / Expand
     * ============================================================ */
    window.toggleMenu = function (el) {
        var children = el.nextElementSibling;
        if (!children || !children.classList.contains('menu-children')) return;

        var isOpen = children.classList.contains('open');

        // close all other open menus
        document.querySelectorAll('.menu-children.open').forEach(function (menu) {
            menu.classList.remove('open');
            if (menu.previousElementSibling) {
                menu.previousElementSibling.classList.remove('expanded');
            }
        });

        if (!isOpen) {
            children.classList.add('open');
            el.classList.add('expanded');
        }
    };

    /* ============================================================
     *  3. Sub-menu Click Highlight
     * ============================================================ */
    function initMenuHighlight() {
        document.addEventListener('click', function (e) {
            var menuItem = e.target.closest('.menu-child');
            if (!menuItem) return;

            document.querySelectorAll('.menu-child.active').forEach(function (item) {
                item.classList.remove('active');
            });
            menuItem.classList.add('active');
        });
    }

    /* ============================================================
     *  4. Breadcrumb Navigation Fix
     * ============================================================ */
    function fixBreadcrumbs() {
        var breadcrumbs = document.querySelectorAll('.breadcrumb a');
        breadcrumbs.forEach(function (link) {
            var text = link.textContent.trim();
            if (text === '首页' || text === 'Home') {
                link.href = 'pos-main-dashboard.html';
            } else if (text !== '首页' && text !== 'Home') {
                // Keep intermediate level links as # (do nothing)
            }
        });
    }

    /* ============================================================
     *  5. Query / Reset Buttons
     * ============================================================ */
    function initSearchButtons() {
        document.addEventListener('click', function (e) {
            var btn = e.target.closest('button, .btn');
            if (!btn) return;

            var text = btn.textContent.trim();

            // Query button: .btn-primary or text contains 查询
            if (
                btn.classList.contains('btn-primary') ||
                text.indexOf('查询') !== -1 ||
                text.indexOf('Search') !== -1 ||
                text.indexOf('搜索') !== -1
            ) {
                // Skip if it's a reset button that also has btn-primary
                if (text.indexOf('重置') !== -1 || text.indexOf('Reset') !== -1) return;
                showToast('Searching...', 'info');
            }

            // Reset button
            if (
                text.indexOf('重置') !== -1 ||
                text.indexOf('Reset') !== -1
            ) {
                // Find the closest form or search area and clear inputs
                var form = btn.closest('form') ||
                           btn.closest('.search-area') ||
                           btn.closest('.search-bar') ||
                           btn.closest('.filter-area');
                if (form) {
                    form.querySelectorAll('input[type="text"], input[type="search"], input[type="number"], input[type="date"], input[type="datetime-local"], select').forEach(function (input) {
                        input.value = '';
                    });
                }
                showToast('Search criteria reset', 'success');
            }
        });
    }

    /* ============================================================
     *  6. Modal Close
     * ============================================================ */
    function initModalClose() {
        document.addEventListener('click', function (e) {
            // Close button / data-dismiss
            var closeBtn = e.target.closest('.modal-close, .close, [data-dismiss="modal"], [data-dismiss]');
            if (closeBtn) {
                e.preventDefault();
                var modal = closeBtn.closest('.modal') ||
                            closeBtn.closest('.dialog') ||
                            closeBtn.closest('.popup');
                if (modal) {
                    modal.classList.remove('open');
                    modal.classList.remove('show');
                    modal.style.display = 'none';
                }
                return;
            }

            // Click overlay to close
            if (e.target.classList.contains('modal-overlay')) {
                var overlayModal = e.target.querySelector('.modal, .dialog, .popup') ||
                                   e.target.nextElementSibling;
                if (overlayModal) {
                    overlayModal.classList.remove('open');
                    overlayModal.classList.remove('show');
                    overlayModal.style.display = 'none';
                }
            }
        });
    }

    /* ============================================================
     *  7. Export Button
     * ============================================================ */
    function initExportButton() {
        document.addEventListener('click', function (e) {
            var btn = e.target.closest('button, .btn, a');
            if (!btn) return;

            var text = btn.textContent.trim();
            if (
                text.indexOf('导出') !== -1 ||
                text.indexOf('Export') !== -1 ||
                btn.classList.contains('btn-export')
            ) {
                showToast('Exporting...', 'info');
            }
        });
    }

    /* ============================================================
     *  8. Pagination
     * ============================================================ */
    function initPagination() {
        document.addEventListener('click', function (e) {
            var pageItem = e.target.closest('.pagination li, .pagination a, .pager li, .pager a');
            if (!pageItem) return;

            // Skip prev/next/ellipsis
            if (
                pageItem.classList.contains('prev') ||
                pageItem.classList.contains('next') ||
                pageItem.classList.contains('disabled') ||
                pageItem.textContent.trim() === '...' ||
                pageItem.textContent.trim() === '»' ||
                pageItem.textContent.trim() === '«'
            ) return;

            var pagination = pageItem.closest('.pagination, .pager');
            if (!pagination) return;

            pagination.querySelectorAll('li.active, a.active').forEach(function (item) {
                item.classList.remove('active');
            });

            // Find the li wrapper
            var li = pageItem.closest('li') || pageItem;
            li.classList.add('active');

            // Also highlight the a tag if exists
            var link = li.querySelector('a');
            if (link) link.classList.add('active');
        });
    }

    /* ============================================================
     *  9. Date Filter Buttons
     * ============================================================ */
    function initDateFilterButtons() {
        document.addEventListener('click', function (e) {
            var btn = e.target.closest('.date-filter .btn, .date-tabs .btn, .date-shortcuts .btn, [data-date-filter]');
            if (!btn) return;

            var group = btn.closest('.date-filter, .date-tabs, .date-shortcuts, .filter-group');
            if (!group) return;

            group.querySelectorAll('.btn.active').forEach(function (b) {
                b.classList.remove('active');
            });
            btn.classList.add('active');
        });
    }

    /* ============================================================
     * 10. Mobile Menu Toggle
     * ============================================================ */
    window.toggleMobileMenu = function () {
        var sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('mobile-open');
        }
    };

    /* ============================================================
     * 11. Fullscreen Toggle
     * ============================================================ */
    window.toggleFullscreen = function () {
        if (!document.fullscreenElement &&
            !document.webkitFullscreenElement &&
            !document.mozFullScreenElement &&
            !document.msFullscreenElement) {
            var elem = document.documentElement;
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    };

    /* ============================================================
     * 12. User Menu Placeholder
     * ============================================================ */
    window.toggleUserMenu = function () {
        // placeholder - implement user dropdown logic here
    };

    /* ============================================================
     * 13. Header-User Dropdown Prevent Default
     * ============================================================ */
    function initHeaderUserDropdown() {
        document.addEventListener('click', function (e) {
            var headerUser = e.target.closest('.header-user');
            if (!headerUser) return;

            var link = e.target.closest('a');
            if (link) {
                e.preventDefault();
            }
        });
    }

    /* ============================================================
     * 14. Table Operation Links (javascript:void(0))
     * ============================================================ */
    function initTableOperationLinks() {
        document.addEventListener('click', function (e) {
            var link = e.target.closest('a[href="javascript:void(0)"]');
            if (!link) return;

            var text = link.textContent.trim();
            if (text) {
                showToast(text, 'info');
            }
        });
    }

    /* ============================================================
     *  Initialization
     * ============================================================ */
    function init() {
        injectToastStyles();
        initMenuHighlight();
        fixBreadcrumbs();
        initSearchButtons();
        initModalClose();
        initExportButton();
        initPagination();
        initDateFilterButtons();
        initHeaderUserDropdown();
        initTableOperationLinks();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
