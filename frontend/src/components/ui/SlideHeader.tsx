export function SlideHeader({ children }: { children: React.ReactNode }) {
  return (
    <h1
      style={{
        textAlign: 'center',
        fontSize: '84pt',
        fontWeight: 'normal',
        marginTop: '75px',
        marginBottom: '25px',
        height: '200px',
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
