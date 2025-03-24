import { FaWhatsapp } from "react-icons/fa6";

const WhatsAppButton = () => {
  return (
    <a
      href="https://wa.me/+6285190231484?text=Halo%20saya%20ingin%20bertanya%20tentang%20produk"
      target="_blank"
      rel="noopener noreferrer"
      className="floating-whatsapp"
    >
      <FaWhatsapp size={20} />
    </a>
  );
};

export default WhatsAppButton;
