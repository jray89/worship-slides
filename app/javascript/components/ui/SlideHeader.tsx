export function SlideHeader({ children }: { children: React.ReactNode }) {
  return (
    <h1
      style={{
        textAlign: 'center',
        fontSize: '60px',
        fontWeight: 'normal',
        marginTop: '50px',
        marginBottom: '50px',
        height: '100px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        color: '#d9d9d9',
      }}
    >
      {children}
    </h1>
  );
}
