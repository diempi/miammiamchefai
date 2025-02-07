interface LogoPropsType {
  width?: string;
  height?: string;
}

export function Logo(props: LogoPropsType) {
  const width = props.width || "151";
  const height = props.height || "44";

  return (
    <img
      src="/img/privy-mmcai-logo.png"
      alt="Logo"
      width={width}
      height={height}
      style={{ objectFit: 'contain' }}
    />
  );
}
