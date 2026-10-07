import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import SlideCarousel from './SlideCarousel';
import ScriptureSlide from './slides/ScriptureSlide';
import type { RenderedPage } from '@/lib/types';
import { allPages } from '@/test/pages';

describe('SlideCarousel', () => {
  it('says when there is nothing to preview', () => {
    render(<SlideCarousel pages={[]} />);

    expect(screen.getByText('No slides to preview.')).toBeInTheDocument();
  });

  it('steps through every slide type', async () => {
    render(<SlideCarousel pages={allPages} />);
    const prev = screen.getByRole('button', { name: '← Prev' });
    const next = screen.getByRole('button', { name: 'Next →' });

    expect(prev).toBeDisabled();
    expect(screen.getByText(/Please pray for God's blessing/)).toBeInTheDocument();

    await userEvent.click(next);
    expect(screen.getByText('Psalm 23:1-3')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // verse number superscript

    await userEvent.click(next);
    expect(screen.getByText('For God so loved')).toBeInTheDocument();

    await userEvent.click(next);
    expect(screen.getByText('But speak thou the things')).toBeInTheDocument();

    await userEvent.click(next);
    expect(screen.getByText('Private prayer is in progress.')).toBeInTheDocument();

    await userEvent.click(next);
    expect(screen.queryByText(/Smyrna/)).not.toBeInTheDocument(); // blank slide omits the address

    await userEvent.click(next);
    expect(screen.getByText(/Smyrna/)).toBeInTheDocument();
    expect(screen.getByText('Slide 7 of 7')).toBeInTheDocument();
    expect(next).toBeDisabled();

    await userEvent.click(prev);
    expect(screen.getByText('Slide 6 of 7')).toBeInTheDocument();
  });

  it('labels slide types it does not know', () => {
    render(<SlideCarousel pages={[{ slide_type: 'mystery' } as unknown as RenderedPage]} />);

    expect(screen.getByText('Unknown: mystery')).toBeInTheDocument();
  });
});

describe('ScriptureSlide', () => {
  it('accepts a single string of text', () => {
    render(<ScriptureSlide reference='Ps 1' text='Blessed is the man' />);

    expect(screen.getByText('Blessed is the man')).toBeInTheDocument();
  });
});
