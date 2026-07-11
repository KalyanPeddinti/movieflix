{pkgs}: {
  deps = [
    pkgs.chromium
    pkgs.libxkbcommon
    pkgs.alsa-lib
    pkgs.mesa
    pkgs.libdrm
    pkgs.fontconfig
    pkgs.pango
    pkgs.cairo
    pkgs.expat
    pkgs.xorg.libxcb
    pkgs.xorg.libXrandr
    pkgs.xorg.libXfixes
    pkgs.xorg.libXext
    pkgs.xorg.libXdamage
    pkgs.xorg.libXcomposite
    pkgs.xorg.libX11
    pkgs.cups
    pkgs.at-spi2-atk
    pkgs.atk
    pkgs.dbus
    pkgs.nspr
    pkgs.nss
    pkgs.glib
  ];
}
