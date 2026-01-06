const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
    }).format(price || 0);
};

const sendOrderConfirmationEmail = async (order, userEmail, userName) => {
    try {
        const orderNumber = order._id.toString();
        const orderDate = new Date(order.createdAt).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

        // Générer le HTML des produits
        const productsHtml = order.orderItems.map(item => `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 15px 0;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;" />
                        <div>
                            <div style="font-weight: 600; color: #333; margin-bottom: 5px;">${item.name}</div>
                            <div style="color: #666; font-size: 14px;">Quantité: ${item.qty}</div>
                        </div>
                    </div>
                </td>
                <td style="padding: 15px 0; text-align: right; color: #333; font-weight: 600;">
                    ${formatPrice(item.price * item.qty)}
                </td>
            </tr>
        `).join('');

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                <div style="background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%); padding: 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Confirmation de commande</h1>
                </div>
                
                <div style="padding: 30px;">
                    <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
                        Bonjour ${userName},
                    </p>
                    <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 30px;">
                        Merci pour votre commande ! Nous avons bien reçu votre paiement et votre commande est en cours de traitement.
                    </p>

                    <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                        <div style="margin-bottom: 15px;">
                            <strong style="color: #333;">Numéro de commande:</strong>
                            <span style="color: #d4af37; font-weight: 600; margin-left: 10px;">#${orderNumber}</span>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <strong style="color: #333;">Date de commande:</strong>
                            <span style="color: #666; margin-left: 10px;">${orderDate}</span>
                        </div>
                        <div>
                            <strong style="color: #333;">Méthode de paiement:</strong>
                            <span style="color: #666; margin-left: 10px; text-transform: capitalize;">${order.paymentMethod}</span>
                        </div>
                    </div>

                    <h2 style="color: #333; font-size: 20px; margin-bottom: 20px; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
                        Articles commandés
                    </h2>
                    
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                        <thead>
                            <tr style="border-bottom: 2px solid #d4af37;">
                                <th style="text-align: left; padding: 10px 0; color: #333; font-weight: 600;">Produit</th>
                                <th style="text-align: right; padding: 10px 0; color: #333; font-weight: 600;">Prix</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productsHtml}
                        </tbody>
                    </table>

                    <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span style="color: #666;">Sous-total:</span>
                            <span style="color: #333; font-weight: 600;">${formatPrice(order.itemsPrice)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span style="color: #666;">Frais de livraison:</span>
                            <span style="color: #333; font-weight: 600;">${formatPrice(order.shippingPrice)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span style="color: #666;">TVA:</span>
                            <span style="color: #333; font-weight: 600;">${formatPrice(order.taxPrice)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding-top: 15px; border-top: 2px solid #d4af37; margin-top: 15px;">
                            <span style="color: #333; font-size: 18px; font-weight: 600;">Total:</span>
                            <span style="color: #d4af37; font-size: 20px; font-weight: 700;">${formatPrice(order.totalPrice)}</span>
                        </div>
                    </div>

                    <div style="background-color: #fff8e1; border-left: 4px solid #d4af37; padding: 15px; margin-bottom: 30px;">
                        <h3 style="color: #333; font-size: 16px; margin: 0 0 10px 0;">Adresse de livraison</h3>
                        <p style="color: #666; font-size: 14px; margin: 0; line-height: 1.6;">
                            ${order.shippingAddress.address}<br>
                            ${order.shippingAddress.postalCode} ${order.shippingAddress.city}<br>
                            ${order.shippingAddress.country}
                        </p>
                    </div>

                    <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
                        Vous recevrez un email de confirmation lorsque votre commande sera expédiée.
                    </p>

                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/order/${orderNumber}" 
                           style="background-color: #d4af37; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: 600;">
                            Voir ma commande
                        </a>
                    </div>
                </div>

                <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                    <p style="color: #999; font-size: 12px; margin: 0;">
                        Si vous avez des questions concernant votre commande, n'hésitez pas à nous contacter.
                    </p>
                </div>
            </div>
        `;

        await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
            to: userEmail,
            subject: `Confirmation de commande #${orderNumber} - E-perfume`,
            html: html,
        });
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email de confirmation:', error);
        // Ne pas bloquer le processus si l'email échoue
    }
};

module.exports = { sendOrderConfirmationEmail };
