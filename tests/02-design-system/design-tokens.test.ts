import { describe, it, expect } from 'vitest';
import { colors, typography, spacing, chrome, radii, shadows } from '../../packages/ui/src/tokens/index';
import { getStatusBadgeStyles } from '../../packages/ui/src/components/status-badge';
import { getPriorityConfig, getPriorityStyles } from '../../packages/ui/src/components/priority-indicator';
import { getCardStyles } from '../../packages/ui/src/components/card';
import { getBrandWordmarkStyles } from '../../packages/ui/src/components/brand-wordmark';
import { getTopNavTabStyles } from '../../packages/ui/src/components/top-nav-tabs';
import { getGlobalSearchStyles } from '../../packages/ui/src/components/global-search';
import { getSidebarGroupStyles } from '../../packages/ui/src/components/sidebar-group';
import { getPageHeaderStyles } from '../../packages/ui/src/components/page-header';
import { getOperationalCardStyles } from '../../packages/ui/src/components/operational-card';
import { getUserAvatarStyles } from '../../packages/ui/src/components/user-avatar';
import { getCommanderAIButtonStyles } from '../../packages/ui/src/components/commander-ai-button';

/**
 * Design System Token & Component Tests — Commander SDR (v1.3.2 Remediated)
 *
 * Validates all 18 v1.3.2 EARS requirements plus existing component adherence.
 */

describe('v1.3.2 Req 1-3 — Typography', () => {
  it('Req 1: Inter is the single application font family (single-font system)', () => {
    expect(typography.fontFamily.display).toContain('Inter');
  });

  it('Req 2: Inter is the body font family', () => {
    expect(typography.fontFamily.body).toContain('Inter');
  });

  it('Req 3: 14px base font size', () => {
    expect(typography.fontSize.base).toBe('14px');
  });
});

describe('v1.3.2 Req 4-7 — Colour Palette', () => {
  it('Req 4: Navy primary is exactly #061936', () => {
    expect(colors.navy.primary).toBe('#061936');
  });

  it('Req 4: Navy variant is exactly #071f43', () => {
    expect(colors.navy.variant).toBe('#071f43');
  });

  it('Req 5: Gold accent is exactly #ffd21f', () => {
    expect(colors.gold.primary).toBe('#ffd21f');
  });

  it('Req 6: Operational App page background is #f2f5f9', () => {
    expect(colors.operational.page).toBe('#f2f5f9');
  });

  it('Req 6: Operational App panel is #fff', () => {
    expect(colors.operational.panel).toBe('#ffffff');
  });

  it('Req 6: Operational App ink text is #0e1d32', () => {
    expect(colors.operational.ink).toBe('#0e1d32');
  });

  it('Req 7: Control Plane background is #0d0d0d', () => {
    expect(colors.controlPlane.background).toBe('#0d0d0d');
  });

  it('Req 7: Control Plane text is #f4f4f4', () => {
    expect(colors.controlPlane.text).toBe('#f4f4f4');
  });
});

describe('v1.3.2 Req 8-9 — Chrome Dimensions', () => {
  it('Req 8: Top bar height is exactly 68px', () => {
    expect(chrome.topBarHeight).toBe('68px');
  });

  it('Req 9: Sidebar width is exactly 306px', () => {
    expect(chrome.sidebarWidth).toBe('306px');
  });

  it('Req 9: Sidebar narrows to 286px below 1450px', () => {
    expect(chrome.sidebarWidthNarrow).toBe('286px');
    expect(chrome.sidebarBreakpoint).toBe('1450px');
  });
});

describe('v1.3.2 Req 10 — BrandWordmark', () => {
  it('renders without error', () => {
    const styles = getBrandWordmarkStyles();
    expect(styles).toBeDefined();
  });

  it('uses Inter for all brand elements (single-font system)', () => {
    const styles = getBrandWordmarkStyles();
    expect(styles.seiertech.fontFamily).toContain('Inter');
    expect(styles.commander.fontFamily).toContain('Inter');
    expect(styles.sdr.fontFamily).toContain('Inter');
  });

  it('SEIERTECH is cream #f4f1eb', () => {
    const styles = getBrandWordmarkStyles();
    expect(styles.seiertech.color).toBe('#f4f1eb');
  });

  it('COMMANDER is gold #ffd21f', () => {
    const styles = getBrandWordmarkStyles();
    expect(styles.commander.color).toBe('#ffd21f');
  });

  it('SDR is white', () => {
    const styles = getBrandWordmarkStyles();
    expect(styles.sdr.color).toBe('#ffffff');
  });

  it('pipe is gold', () => {
    const styles = getBrandWordmarkStyles();
    expect(styles.pipe.background).toBe('#ffd21f');
  });
});

describe('v1.3.2 Req 11 — TopNavTabs', () => {
  it('renders without error', () => {
    const styles = getTopNavTabStyles();
    expect(styles).toBeDefined();
  });

  it('active tab has 3px gold border-bottom', () => {
    const styles = getTopNavTabStyles();
    expect(styles.tabActive.borderBottom).toContain('#ffd21f');
    expect(styles.tabActive.borderBottom).toContain('3px');
  });

  it('active tab has gold tint background', () => {
    const styles = getTopNavTabStyles();
    expect(styles.tabActive.background).toBe('rgba(255,210,31,.055)');
  });
});

describe('v1.3.2 Req 12 — GlobalSearch', () => {
  it('renders without error', () => {
    const styles = getGlobalSearchStyles();
    expect(styles).toBeDefined();
  });

  it('container is 440px wide', () => {
    const styles = getGlobalSearchStyles();
    expect(styles.container.width).toBe('440px');
  });

  it('has translucent white background', () => {
    const styles = getGlobalSearchStyles();
    expect(styles.container.background).toBe('rgba(255,255,255,.075)');
  });
});

describe('v1.3.2 Req 13-15 — Sidebar', () => {
  it('Req 13: sidebar gradient colours defined', () => {
    expect(colors.navy.sidebar).toBe('#06152d');
    expect(colors.navy.sidebarEnd).toBe('#030e1e');
  });

  it('Req 14: SidebarGroup renders with gold divider', () => {
    const styles = getSidebarGroupStyles();
    expect(styles.subItems.borderLeft).toContain('rgba(255,210,31,.16)');
  });

  it('Req 15: scrollbar width is 6px', () => {
    expect(chrome.scrollbarWidth).toBe('6px');
  });

  it('Req 15: scrollbar thumb is gold', () => {
    expect(colors.gold.scrollThumb).toBe('rgba(255,210,31,.55)');
  });
});

describe('v1.3.2 Req 16 — PageHeader', () => {
  it('renders without error', () => {
    const styles = getPageHeaderStyles();
    expect(styles).toBeDefined();
  });

  it('has white background with #dbe3ef border', () => {
    const styles = getPageHeaderStyles();
    expect(styles.container.background).toBe('#ffffff');
    expect(styles.container.borderBottom).toContain('#dbe3ef');
  });

  it('title is 24px', () => {
    const styles = getPageHeaderStyles();
    expect(styles.title.fontSize).toBe('24px');
  });

  it('eyebrow is uppercase with 0.09em tracking', () => {
    const styles = getPageHeaderStyles();
    expect(styles.eyebrow.textTransform).toBe('uppercase');
    expect(styles.eyebrow.letterSpacing).toBe('0.09em');
  });

  it('status dot is green #1a7a3f', () => {
    const styles = getPageHeaderStyles();
    expect(styles.statusDot.background).toBe('#1a7a3f');
  });
});

describe('v1.3.2 Req 17 — OperationalCard', () => {
  it('renders without error', () => {
    const styles = getOperationalCardStyles();
    expect(styles).toBeDefined();
  });

  it('white background with #dbe3ef border', () => {
    const styles = getOperationalCardStyles();
    expect(styles.card.background).toBe('#ffffff');
    expect(styles.card.border).toContain('#dbe3ef');
  });

  it('18px padding', () => {
    const styles = getOperationalCardStyles();
    expect(styles.card.padding).toBe('18px');
  });

  it('title is uppercase 14px with 0.06em tracking', () => {
    const styles = getOperationalCardStyles();
    expect(styles.title.textTransform).toBe('uppercase');
    expect(styles.title.fontSize).toBe('14px');
    expect(styles.title.letterSpacing).toBe('0.06em');
  });

  it('body text is #68758b', () => {
    const styles = getOperationalCardStyles();
    expect(styles.body.color).toBe('#68758b');
  });
});

describe('v1.3.2 Req 18 — UserAvatar', () => {
  it('renders without error', () => {
    const styles = getUserAvatarStyles();
    expect(styles).toBeDefined();
  });

  it('avatar is 34px', () => {
    const styles = getUserAvatarStyles();
    expect(styles.avatar.width).toBe('34px');
    expect(styles.avatar.height).toBe('34px');
  });

  it('avatar uses gold colour and Inter font (single-font system)', () => {
    const styles = getUserAvatarStyles();
    expect(styles.avatar.color).toBe('#ffd21f');
    expect(styles.avatar.fontFamily).toContain('Inter');
  });

  it('name is 12px bold', () => {
    const styles = getUserAvatarStyles();
    expect(styles.name.fontSize).toBe('12px');
    expect(styles.name.fontWeight).toBe('700');
  });

  it('role is 10px muted', () => {
    const styles = getUserAvatarStyles();
    expect(styles.role.fontSize).toBe('10px');
  });
});

describe('CommanderAIButton', () => {
  it('renders without error', () => {
    const styles = getCommanderAIButtonStyles();
    expect(styles).toBeDefined();
  });

  it('white background with gold border', () => {
    const styles = getCommanderAIButtonStyles();
    expect(styles.button.background).toBe('#ffffff');
    expect(styles.button.border).toContain('rgba(255,210,31');
  });
});

describe('Existing Components — Updated', () => {
  it('StatusBadge BUILD uses gold #ffd21f', () => {
    const styles = getStatusBadgeStyles({ status: 'BUILD' });
    expect(styles.backgroundColor).toBe('#ffd21f');
  });

  it('PriorityIndicator P0 still has emergency styling', () => {
    const styles = getPriorityStyles({ priority: 'P0' });
    expect(styles.boxShadow).not.toBe('none');
  });

  it('Card default uses operational panel background', () => {
    const styles = getCardStyles();
    expect(styles.backgroundColor).toBe('#ffffff');
  });

  it('all priorities have distinct shapes (accessibility)', () => {
    const priorities = ['P0', 'P1', 'P2', 'P3', 'P4'] as const;
    const shapes = priorities.map((p) => getPriorityConfig(p).shape);
    const unique = new Set(shapes);
    expect(unique.size).toBe(5);
  });
});
