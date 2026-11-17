import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, CheckCircle2, Coffee, ImagePlus, Send, Wrench } from 'lucide-react';

const categories = [
  'Elektronika a spotřebiče',
  'Nábytek a vybavení domácnosti',
  'Oblečení a textil',
  'Kola a sportovní vybavení',
  'Hračky a další předměty',
  'Jiné',
];

export default function CreateRequestPage() {
  const navigate = useNavigate();
  const [photoName, setPhotoName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    // V tomto kroku se data pouze validují v prohlížeči. Uložení bude doplněno po rozšíření backendu.
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (submitted) {
    return (
      <div className="request-page">
        <header className="form-header">
          <Link className="brand" to="/"><span className="brand-mark"><Coffee /></span><b>Repair Café</b></Link>
        </header>
        <main className="success-card">
          <span className="success-icon"><CheckCircle2 size={34} /></span>
          <span className="eyebrow">FORMULÁŘ VYPLNĚN</span>
          <h1>Požadavek je připravený.</h1>
          <p>Formulář prošel kontrolou. V této verzi se požadavek ještě neukládá na server. Uložení a odeslání doplníme po dokončení příslušného API v backendu.</p>
          <div className="success-actions">
            <button className="button button-primary" onClick={() => navigate('/')}>Zpět na úvodní stránku</button>
            <button className="button button-secondary" onClick={() => { setSubmitted(false); window.scrollTo({ top: 0 }); }}>Vytvořit další požadavek</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="request-page">
      <header className="form-header">
        <Link className="brand" to="/"><span className="brand-mark"><Coffee /></span><b>Repair Café</b></Link>
        <Link className="header-back" to="/"><ArrowLeft size={17} /> Zpět na úvodní stránku</Link>
      </header>
      <main className="request-content">
        <div className="request-heading">
          <span className="eyebrow">POTŘEBUJI OPRAVU</span>
          <h1>Popište, s čím potřebujete pomoci.</h1>
          <p>Vyplňte základní informace o věci, kterou chcete opravit. Dobrovolníci díky tomu lépe poznají, zda vám mohou pomoci.</p>
        </div>

        <form className="request-form" onSubmit={handleSubmit}>
          <section className="form-section">
            <div className="form-section-title"><span>01</span><div><h2>Informace o opravě</h2><p>Čím přesněji problém popíšete, tím lépe.</p></div></div>
            <label className="field">Název požadavku <span className="required">*</span>
              <input name="title" required minLength={4} maxLength={100} placeholder="Např. Nefunkční rychlovarná konvice" />
            </label>
            <label className="field">Kategorie <span className="required">*</span>
              <select name="category" required defaultValue=""><option value="" disabled>Vyberte kategorii</option>{categories.map(category => <option key={category}>{category}</option>)}</select>
            </label>
            <label className="field">Popis problému <span className="required">*</span>
              <textarea name="description" required minLength={10} maxLength={2000} rows={6} placeholder="Popište, co je potřeba opravit, co se stalo a co jste už případně zkoušeli…" />
              <small>Uveďte například značku, model nebo projevy závady, pokud je znáte.</small>
            </label>
            <label className="field">Fotografie <span className="optional">(nepovinné)</span>
              <span className="upload-box"><ImagePlus size={23}/><strong>Přidat fotografii</strong><span>Vyberte obrázek ze svého zařízení</span><input type="file" accept="image/*" onChange={e => setPhotoName(e.target.files?.[0]?.name || '')} /></span>
              {photoName && <span className="file-selected"><Camera size={15}/>{photoName}</span>}
            </label>
          </section>

          <section className="form-section">
            <div className="form-section-title"><span>02</span><div><h2>Kontaktní údaje</h2><p>Kontakt bude zpřístupněn až po vašem schválení zájmu dobrovolníka.</p></div></div>
            <label className="field">E-mail <span className="required">*</span>
              <input type="email" name="email" required autoComplete="email" placeholder="vas@email.cz" />
            </label>
            <label className="field">Telefon <span className="optional">(nepovinné)</span>
              <input type="tel" name="phone" autoComplete="tel" placeholder="+420 123 456 789" />
            </label>
          </section>

          <div className="form-privacy"><Wrench size={18}/><p>Vaše kontaktní údaje nebudou veřejně zobrazeny. Dobrovolník je uvidí až poté, co potvrdíte jeho zájem o opravu.</p></div>
          <div className="request-submit"><span><span className="required">*</span> Povinné údaje</span><button className="button button-primary" type="submit">Zkontrolovat požadavek <Send size={17}/></button></div>
          <p className="prototype-note">Prototyp: odeslání zatím neukládá data do databáze. Napojení na backend bude následovat v samostatném kroku.</p>
        </form>
      </main>
      <footer className="request-footer">Repair Café · Komunitní opravy</footer>
    </div>
  );
}
