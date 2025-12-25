import logo from "../assets/logo.png";

function Header() {
  return (
    <nav className="navbar bg-light shadow-sm">
      <div className="container justify-content-center">
        <img
          src={logo}
          alt="Logo"
          height="50"
        />
      </div>
    </nav>
  );
}

export default Header;
