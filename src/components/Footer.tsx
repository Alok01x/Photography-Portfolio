export default function Footer() {
    return (
        <footer style={{
            padding: '2rem 0',
            textAlign: 'center',
            borderTop: '1px solid hsl(var(--border))',
            marginTop: 'auto',
            fontSize: '0.875rem',
            color: 'hsl(var(--muted-foreground))'
        }}>
            <div className="container">
                <p>&copy; {new Date().getFullYear()} Photography Portfolio. All rights reserved.</p>
            </div>
        </footer>
    );
}
