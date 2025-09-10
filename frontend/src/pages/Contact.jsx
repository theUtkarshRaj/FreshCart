import React from 'react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import contactStyles from '../assets/dummyStyles'
import { FiMail, FiUser, FiPhone } from 'react-icons/fi'

function Contact() {
  const [form, setForm] = React.useState({ name: '', email: '', phone: '', message: '' })
  const [sent, setSent] = React.useState(false)
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const onSubmit = (e) => {
    e.preventDefault(); setSent(true); setTimeout(()=>setSent(false), 2000); setForm({ name:'', email:'', phone:'', message:'' })
  }
  return (
    <div>
      <Navbar />
      {sent && (<div className={contactStyles.toast}><span className="mr-2">✅</span> Message sent successfully</div>)}
      <div className={contactStyles.pageContainer}>
        <div className={contactStyles.centeredContainer}>
          <div className={contactStyles.headingContainer}>
            <h1 className={contactStyles.heading}>Get in touch</h1>
            <div className={contactStyles.divider}></div>
          </div>
          <div className={contactStyles.contactFormContainer}>
            <form onSubmit={onSubmit} className={contactStyles.form}>
              <div className={contactStyles.formField}>
                <div className={contactStyles.inputContainer}>
                  <div className={contactStyles.inputIconContainer}><FiUser className={contactStyles.inputIcon} /></div>
                  <input name="name" value={form.name} onChange={onChange} placeholder="Your name" className={contactStyles.formInput} />
                </div>
              </div>
              <div className={contactStyles.formField}>
                <div className={contactStyles.inputContainer}>
                  <div className={contactStyles.inputIconContainer}><FiMail className={contactStyles.inputIcon} /></div>
                  <input type="email" name="email" value={form.email} onChange={onChange} placeholder="Email" className={contactStyles.formInput} />
                </div>
              </div>
              <div className={contactStyles.formField}>
                <div className={contactStyles.inputContainer}>
                  <div className={contactStyles.inputIconContainer}><FiPhone className={contactStyles.inputIcon} /></div>
                  <input name="phone" value={form.phone} onChange={onChange} placeholder="Phone number" className={contactStyles.formInput} />
                </div>
              </div>
              <div className={contactStyles.formField}>
                <div className={contactStyles.inputContainer}>
                  <textarea name="message" value={form.message} onChange={onChange} placeholder="Your message" className={contactStyles.formTextarea} />
                </div>
              </div>
              <button className={contactStyles.submitButton}><span className={contactStyles.submitButtonText}>Send</span></button>
            </form>
          </div>
        </div>
        <style>{contactStyles.customCSS}</style>
      </div>
      <Footer />
    </div>
  )
}

export default Contact
