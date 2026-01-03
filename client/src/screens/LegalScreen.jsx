import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const LegalScreen = () => {
  return (
    <div className="min-h-screen bg-luxe-cream">
      <Helmet>
        <title>Mentions Légales - E-Parfume</title>
        <meta name="description" content="Mentions légales du site E-Parfume" />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-16">
        <div className="bg-luxe-warm-white rounded-lg border border-luxe-charcoal/10 p-8 md:p-12 shadow-lg">
          <h1 className="font-serif text-4xl md:text-5xl font-light text-luxe-black mb-8">
            Mentions Légales
          </h1>

          <div className="space-y-8 font-sans text-sm text-luxe-charcoal/80 leading-relaxed">
            {/* Éditeur du site */}
            <section>
              <h2 className="font-serif text-2xl font-light text-luxe-black mb-4">
                1. Éditeur du site
              </h2>
              <p className="mb-2">
                Le site <strong>E-Parfume</strong> est édité par :
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Raison sociale :</strong> E-Parfume SARL</li>
                <li><strong>Forme juridique :</strong> Société à Responsabilité Limitée</li>
                <li><strong>Capital social :</strong> 10 000 €</li>
                <li><strong>Siège social :</strong> 123 Avenue des Champs-Élysées, 75008 Paris, France</li>
                <li><strong>SIRET :</strong> 123 456 789 00012</li>
                <li><strong>RCS :</strong> Paris B 123 456 789</li>
                <li><strong>TVA Intracommunautaire :</strong> FR 12 123456789</li>
                <li><strong>Directeur de publication :</strong> Directeur Général</li>
              </ul>
            </section>

            {/* Hébergement */}
            <section>
              <h2 className="font-serif text-2xl font-light text-luxe-black mb-4">
                2. Hébergement
              </h2>
              <p className="mb-2">
                Le site est hébergé par :
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Hébergeur :</strong> Vercel Inc.</li>
                <li><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis</li>
                <li><strong>Site web :</strong> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-luxe-gold hover:underline">vercel.com</a></li>
              </ul>
            </section>

            {/* Propriété intellectuelle */}
            <section>
              <h2 className="font-serif text-2xl font-light text-luxe-black mb-4">
                3. Propriété intellectuelle
              </h2>
              <p className="mb-2">
                L'ensemble des éléments du site E-Parfume, qu'ils soient visuels ou sonores, y compris la technologie sous-jacente, sont protégés par le droit d'auteur, des marques ou des brevets. Ils sont la propriété exclusive de E-Parfume SARL.
              </p>
              <p className="mb-2">
                Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de E-Parfume SARL.
              </p>
            </section>

            {/* Protection des données personnelles */}
            <section>
              <h2 className="font-serif text-2xl font-light text-luxe-black mb-4">
                4. Protection des données personnelles
              </h2>
              <p className="mb-2">
                Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition aux données personnelles vous concernant.
              </p>
              <p className="mb-2">
                Pour exercer ces droits, vous pouvez nous contacter à l'adresse suivante : <a href="mailto:contact@e-perfume.com" className="text-luxe-gold hover:underline">contact@e-perfume.com</a>
              </p>
              <p className="mb-2">
                Les données collectées sont utilisées exclusivement pour la gestion de votre commande et l'amélioration de nos services. Elles ne sont en aucun cas transmises à des tiers à des fins commerciales.
              </p>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="font-serif text-2xl font-light text-luxe-black mb-4">
                5. Cookies
              </h2>
              <p className="mb-2">
                Le site utilise des cookies pour améliorer l'expérience utilisateur et analyser le trafic. En continuant à naviguer sur le site, vous acceptez l'utilisation de cookies conformément à notre politique de cookies.
              </p>
            </section>

            {/* Responsabilité */}
            <section>
              <h2 className="font-serif text-2xl font-light text-luxe-black mb-4">
                6. Responsabilité
              </h2>
              <p className="mb-2">
                E-Parfume SARL s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur le site. Toutefois, E-Parfume SARL ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition sur le site.
              </p>
              <p className="mb-2">
                E-Parfume SARL ne pourra être tenue responsable des dommages directs ou indirects causés au matériel de l'utilisateur, lors de l'accès au site, et résultant soit de l'utilisation d'un matériel ne répondant pas aux spécifications, soit de l'apparition d'un bug ou d'une incompatibilité.
              </p>
            </section>

            {/* Droit applicable */}
            <section>
              <h2 className="font-serif text-2xl font-light text-luxe-black mb-4">
                7. Droit applicable et juridiction compétente
              </h2>
              <p className="mb-2">
                Les présentes mentions légales sont régies par le droit français. En cas de litige et à défaut d'accord amiable, le litige sera porté devant les tribunaux français conformément aux règles de compétence en vigueur.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="font-serif text-2xl font-light text-luxe-black mb-4">
                8. Contact
              </h2>
              <p className="mb-2">
                Pour toute question concernant les présentes mentions légales, vous pouvez nous contacter :
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Email :</strong> <a href="mailto:contact@e-perfume.com" className="text-luxe-gold hover:underline">contact@e-perfume.com</a></li>
                <li><strong>Téléphone :</strong> +33 1 23 45 67 89</li>
                <li><strong>Adresse :</strong> 123 Avenue des Champs-Élysées, 75008 Paris, France</li>
              </ul>
            </section>

            {/* Date de mise à jour */}
            <section className="pt-8 border-t border-luxe-charcoal/10">
              <p className="text-xs text-luxe-charcoal/50 italic">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-luxe-charcoal/10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 font-sans text-sm text-luxe-gold hover:text-luxe-black transition-colors duration-200"
            >
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalScreen;





