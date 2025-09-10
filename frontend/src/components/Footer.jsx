import React from "react";
import { footerStyles } from "../assets/dummyStyles";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaMapMarkedAlt,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";
import { FiLink } from "react-icons/fi";
import { BsTelephone } from "react-icons/bs";

const Footer = () => {
  const socialLinks = [
    {
      icon: FaFacebookF,
      url: "https://www.facebook.com/",
    },
    {
      icon: FaTwitter,
      url: "https://twitter.com/",
    },
    {
      icon: FaInstagram,
      url: "https://www.instagram.com/",
    },
    {
      icon: FaYoutube,
      url: "https://www.youtube.com/",
    },
  ];
  return (
    <footer className={footerStyles.footer}>
      <div className={footerStyles.topBorder}>
        <div
          className={`${footerStyles.floatingShape} -top-24 -right-24 w-80 h-80 opacity-20`}
        ></div>
        <div
          className={`${footerStyles.floatingShape} -bottom-40 -left-24 w-96 h-96 opacity-15 animation-delay-2000`}
        ></div>
        <div
          className={`${footerStyles.floatingShape} top-1/4 left-1/3 w-64 h-64 bg-emerald-600 opacity-10 animate-pulse animation-delay-1000`}
        ></div>
      </div>

      <div className={footerStyles.container}>
        <div className={footerStyles.grid}>
          {/*Brand*/}
          <div>
            <h2 className={footerStyles.brandTitle}>
              RUSH <span className={footerStyles.brandSpan}>BASKET</span>
            </h2>
            <p className={footerStyles.brandText}>
              Bringing you the freshest organic produce since 2010. Our mission
              is to deliver farm-fresh goodness straight to your doorstep.
            </p>
            <div className="space-x-3 flex">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.url}
                  target="_blank"
                  aria-label={`Visit our ${social.icon.name.replace(
                    "Fa",
                    ""
                  )} page`}
                  className={footerStyles.socialLink}
                >
                  <social.icon className={footerStyles.socialIcon} />
                </a>
              ))}
            </div>
          </div>
          {/*Quick Links*/}
          <div>
            <h3 className={footerStyles.sectionTitle}>
              <FiLink className={footerStyles.sectionIcon} />
              Quick Links
            </h3>
            <ul className={footerStyles.linkList}>
              {["Home", "Items", "Contact"].map((item, idx) => (
                <li key={idx}>
                  <a
                    href={`/${item.toLowerCase()}`}
                    className={footerStyles.linkItem}
                  >
                    <span className={footerStyles.linkBullet}></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          {/*Contact Info*/}
          <div>
            <h3 className={footerStyles.sectionTitle}>
              <BsTelephone className={footerStyles.sectionIcon} />
              Contact Us
            </h3>
            <ul className="space-y-4 text-sm sm:text-base">
              <li className={footerStyles.contactItem}>
                <div className={footerStyles.contactIconContainer}>
                  <FaMapMarkedAlt className={footerStyles.contactIcon} />
                </div>
                <div>
                  <p>123 Organic Valley, Green City, GC 54321</p>
                </div>
              </li>

              <li className={footerStyles.contactItem}>
                <div className={footerStyles.contactIconContainer}>
                  <FaPhone className={footerStyles.contactIcon} />
                </div>
                <div>
                  <p>+01 0894561230</p>
                </div>
              </li>
              <li className={footerStyles.contactItem}>
                <div className={footerStyles.contactIconContainer}>
                  <FaEnvelope className={footerStyles.contactIcon} />
                </div>
                <div>
                  <p>FreshCart@gmail.com</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
