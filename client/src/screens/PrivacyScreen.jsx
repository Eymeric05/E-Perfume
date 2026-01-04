import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const PrivacyScreen = () => {
  return (
    <div className="min-h-screen bg-luxe-cream">
      <Helmet>
        <title>Politique de Confidentialité - E-Parfume</title>
        <meta name="description" content="Politique de confidentialité et gestion des cookies du site E-Parfume" />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-16">
        <div className="bg-luxe-warm-white rounded-lg border border-luxe-charcoal/10 p-8 md:p-12 shadow-lg">
          <h1 className="font-serif text-4xl md:text-5xl font-light text-luxe-black mb-8">
            Politique de Confidentialité
          </h1>

          <div className="space-y-8 font-sans text-sm text-luxe-charcoal/80 leading-relaxed">
            {/* Introduction */}
            <section>
              <p className="mb-4">
                La présente politique de confidentialité décrit la façon dont <strong>E-Parfume SARL</strong> collecte, 
                utilise et protège vos informations personnelles lorsque vous utilisez notre site web. 
                Nous nous engageons à respecter votre vie privée et à protéger vos données personnelles 
                conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés.
              </p>
              <p className="mb-2 text-xs text-luxe-charcoal/50 italic">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </section>

            {/* Collecte des données */}
            <section>
              <h2 className="font-serif text-2xl font-light text-luxe-black mb-4">
                1. Données collectées
              </h2>
              <p className="mb-2">
                Nous collectons les informations suivantes lorsque vous utilisez notre site :
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li><strong>Données d'identification :</strong> nom, prénom, adresse e-mail, numéro de téléphone</li>
                <li><strong>Données de commande :</strong> adresse de livraison et de facturation, historique des commandes</li>
                <li><strong>Données de navigation :</strong> adresse IP, type de navigateur, pages visitées, durée de visite</li>
                <li><strong>Données de paiement :</strong> informations de carte bancaire (traitées de manière sécurisée par nos partenaires de paiement)</li>
                <li><strong>Données de préférences :</strong> produits favoris, liste de souhaits, préférences de communication</li>
              </ul>
            </section>

            {/* Utilisation des données */}
            <section>
              <h2 className="font-serif text-2xl font-light text-luxe-black mb-4">
                2. Utilisation des données
              </h2>
              <p className="mb-2">
                Vos données personnelles sont utilisées pour les finalités suivantes :
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Traitement et expédition de vos commandes</li>
                <li>Gestion de votre compte client</li>
                <li>Communication concernant vos commandes et notre service client</li>
                <li>Amélioration de notre site web et de nos services</li>
                <li>Envoi de newsletters et d'offres promotionnelles (avec votre consentement)</li>
                <li>Analyse statistique et mesure de la performance du site</li>
                <li>Prévention de la fraude et sécurisation des transactions</li>
                <li>Respect de nos obligations légales et réglementaires</li>
              </ul>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="font-serif text-2xl font-light text-luxe-black mb-4">
                3. Cookies et technologies similaires
              </h2>
              <p className="mb-4">
                Notre site utilise des cookies pour améliorer votre expérience de navigation. 
                Les cookies sont de petits fichiers texte stockés sur votre appareil lorsque vous visitez un site web.
              </p>
              
              <h3 className="font-serif text-xl font-light text-luxe-black mb-3 mt-6">
                3.1. Types de cookies utilisés
              </h3>
              <ul className="list-disc list-inside ml-4 space-y-2 mb-4">
                <li>
                  <strong>Cookies strictement nécessaires :</strong> Ces cookies sont essentiels au fonctionnement du site. 
                  Ils vous permettent de naviguer sur le site et d'utiliser ses fonctionnalités de base, 
                  comme l'accès à votre compte et la gestion de votre panier. Ces cookies ne peuvent pas être désactivés.
                </li>
                <li>
                  <strong>Cookies fonctionnels :</strong> Ces cookies permettent au site de se souvenir de vos choix 
                  (comme votre langue ou votre région) et de fournir des fonctionnalités améliorées et personnalisées.
                </li>
                <li>
                  <strong>Cookies analytiques :</strong> Ces cookies nous aident à comprendre comment les visiteurs 
                  interagissent avec notre site en collectant et rapportant des informations anonymes. 
                  Ces données nous permettent d'améliorer le fonctionnement du site.
                </li>
                <li>
                  <strong>Cookies de marketing :</strong> Ces cookies peuvent être définis par nos partenaires publicitaires 
                  pour créer un profil de vos intérêts et vous montrer des publicités pertinentes sur d'autres sites. 
                  Ils sont uniquement utilisés avec votre consentement explicite.
                </li>
              </ul>

              <h3 className="font-serif text-xl font-light text-luxe-black mb-3 mt-6">
                3.2. Gestion des cookies
              </h3>
              <p className="mb-2">
                Vous pouvez à tout moment gérer vos préférences de cookies :
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 mb-4">
                <li>Via la bannière de cookies qui s'affiche lors de votre première visite</li>
                <li>En modifiant les paramètres de votre navigateur pour refuser ou supprimer les cookies</li>
                <li>En nous contactant à l'adresse <a href="mailto:contact@e-perfume.com" className="text-luxe-gold hover:underline">contact@e-perfume.com</a></li>
              </ul>
              <p className="mb-2 text-xs text-luxe-charcoal/60 italic">
                Note : La désactivation de certains cookies peut affecter le fonctionnement du site et limiter votre expérience utilisateur.
              </p>
            </section>

            {/* Partage des données */}
            <section>
              <h2 className="font-serif text-2xl font-light text-luxe-black mb-4">
                4. Partage des données
              </h2>
              <p className="mb-2">
                Nous ne vendons jamais vos données personnelles. Vos données peuvent être partagées avec :
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li><strong>Prestataires de services :</strong> services de paiement, transporteurs, hébergeurs, services d'analyse</li>
                <li><strong>Autorités légales :</strong> lorsque requis par la loi ou pour protéger nos droits</li>
                <li><strong>Partenaires de confiance :</strong> uniquement avec votre consentement explicite</li>
              </ul>
              <p className="mt-4 mb-2">
                Tous nos prestataires sont contractuellement tenus de protéger vos données et de ne les utiliser 
                que pour les finalités pour lesquelles elles leur ont été communiquées.
              </p>
            </section>

            {/* Sécurité */}
            <section>
              <h2 className="font-serif text-2xl font-light text-luxe-black mb-4">
                5. Sécurité des données
              </h2>
              <p className="mb-2">
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger 
                vos données personnelles contre tout accès non autorisé, perte, destruction ou altération :
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Chiffrement SSL/TLS pour toutes les transmissions de données</li>
                <li>Stockage sécurisé des données sur des serveurs protégés</li>
                <li>Accès restreint aux données personnelles (principe du besoin d'en connaître)</li>
                <li>Surveillance et audits de sécurité réguliers</li>
                <li>Formation du personnel à la protection des données</li>
              </ul>
            </section>

            {/* Durée de conservation */}
            <section>
              <h2 className="font-serif text-2xl font-light text-luxe-black mb-4">
                6. Durée de conservation
              </h2>
              <p className="mb-2">
                Nous conservons vos données personnelles uniquement pendant la durée nécessaire aux finalités 
                pour lesquelles elles ont été collectées :
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li><strong>Données de compte :</strong> pendant toute la durée de vie de votre compte et 3 ans après sa fermeture</li>
                <li><strong>Données de commande :</strong> 10 ans (obligation légale de conservation des factures)</li>
                <li><strong>Données de navigation :</strong> 13 mois maximum</li>
                <li><strong>Données de marketing :</strong> jusqu'à retrait de votre consentement</li>
              </ul>
            </section>

            {/* Vos droits */}
            <section>
              <h2 className="font-serif text-2xl font-light text-luxe-black mb-4">
                7. Vos droits
              </h2>
              <p className="mb-4">
                Conformément au RGPD, vous disposez des droits suivants concernant vos données personnelles :
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li><strong>Droit d'accès :</strong> obtenir une copie de vos données personnelles</li>
                <li><strong>Droit de rectification :</strong> corriger vos données inexactes ou incomplètes</li>
                <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données</li>
                <li><strong>Droit à la limitation :</strong> restreindre le traitement de vos données</li>
                <li><strong>Droit à la portabilité :</strong> récupérer vos données dans un format structuré</li>
                <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données pour des motifs légitimes</li>
                <li><strong>Droit de retrait du consentement :</strong> retirer votre consentement à tout moment</li>
                <li><strong>Droit de définir des directives post-mortem :</strong> définir le sort de vos données après votre décès</li>
              </ul>
              <p className="mt-4 mb-2">
                Pour exercer ces droits, vous pouvez nous contacter :
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Par email :</strong> <a href="mailto:contact@e-perfume.com" className="text-luxe-gold hover:underline">contact@e-perfume.com</a></li>
                <li><strong>Par courrier :</strong> E-Parfume SARL, 123 Avenue des Champs-Élysées, 75008 Paris, France</li>
              </ul>
              <p className="mt-4 mb-2">
                Vous avez également le droit d'introduire une réclamation auprès de la Commission Nationale 
                de l'Informatique et des Libertés (CNIL) si vous estimez que vos droits ne sont pas respectés :
              </p>
              <p className="mb-2">
                <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-luxe-gold hover:underline">
                  www.cnil.fr
                </a> - 3 Place de Fontenoy, 75007 Paris, France
              </p>
            </section>

            {/* Modifications */}
            <section>
              <h2 className="font-serif text-2xl font-light text-luxe-black mb-4">
                8. Modifications de la politique de confidentialité
              </h2>
              <p className="mb-2">
                Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. 
                Toute modification sera publiée sur cette page avec une date de mise à jour révisée. 
                Nous vous encourageons à consulter régulièrement cette page pour rester informé de la façon 
                dont nous protégeons vos données.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="font-serif text-2xl font-light text-luxe-black mb-4">
                9. Contact
              </h2>
              <p className="mb-4">
                Pour toute question concernant cette politique de confidentialité ou le traitement de vos données personnelles, 
                vous pouvez nous contacter :
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Responsable du traitement :</strong> E-Parfume SARL</li>
                <li><strong>Email :</strong> <a href="mailto:contact@e-perfume.com" className="text-luxe-gold hover:underline">contact@e-perfume.com</a></li>
                <li><strong>Téléphone :</strong> +33 1 23 45 67 89</li>
                <li><strong>Adresse :</strong> 123 Avenue des Champs-Élysées, 75008 Paris, France</li>
              </ul>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-luxe-charcoal/10 flex flex-col sm:flex-row gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 font-sans text-sm text-luxe-gold hover:text-luxe-black transition-colors duration-200"
            >
              ← Retour à l'accueil
            </Link>
            <Link
              to="/legal"
              className="inline-flex items-center gap-2 font-sans text-sm text-luxe-gold hover:text-luxe-black transition-colors duration-200"
            >
              Voir les mentions légales →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyScreen;
