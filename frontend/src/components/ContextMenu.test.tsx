import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContextMenu } from './ContextMenu';

const items = [
  { label: 'Edit', onClick: vi.fn() },
  { label: 'Delete', onClick: vi.fn() },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ContextMenu', () => {
  it('renders null when position is null', () => {
    const { container } = render(
      <ContextMenu position={null} items={items} onClose={vi.fn()} />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders all items when position is provided', () => {
    render(
      <ContextMenu position={{ x: 100, y: 200 }} items={items} onClose={vi.fn()} />,
    );
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('calls onClick and onClose when an item is clicked', () => {
    const onClose = vi.fn();
    render(
      <ContextMenu position={{ x: 0, y: 0 }} items={items} onClose={onClose} />,
    );
    fireEvent.click(screen.getByText('Edit'));
    expect(items[0].onClick).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when overlay is clicked', () => {
    const onClose = vi.fn();
    render(
      <ContextMenu position={{ x: 0, y: 0 }} items={items} onClose={onClose} />,
    );
    const overlay = document.querySelector('.context-menu-overlay')!;
    expect(overlay).toBeInTheDocument();
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn();
    render(
      <ContextMenu position={{ x: 0, y: 0 }} items={items} onClose={onClose} />,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('applies position style', () => {
    render(
      <ContextMenu position={{ x: 150, y: 300 }} items={items} onClose={vi.fn()} />,
    );
    const menu = document.querySelector('.context-menu') as HTMLElement;
    expect(menu.style.top).toBe('300px');
    expect(menu.style.left).toBe('150px');
  });
});
