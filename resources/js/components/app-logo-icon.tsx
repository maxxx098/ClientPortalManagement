import { ImgHTMLAttributes } from "react";
import Logo from '@/assets/logo/Logo.png'
export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      {...props}
      src={Logo}
      alt="App Logo"
      width={40}
      height={42}
    />
  );
}
