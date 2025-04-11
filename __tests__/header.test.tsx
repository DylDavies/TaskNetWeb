import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Header from '@/app/components/Header/header';

/**
 * @jest-environment jsdom
 */

describe('Header', () => {
    it('renders a heading', () => {
        render(<Header name = "holder" usertype="Client" />);

        const heading = screen.getByRole('heading', {level: 1});

        expect(heading).toBeInTheDocument();
    })
});