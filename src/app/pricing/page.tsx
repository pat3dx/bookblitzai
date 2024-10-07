"use client";

import React, { useEffect } from 'react';

declare const paypal: unknown;

const Pricing = () => {
  useEffect(() => {
    const loadPayPalScript = () => {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=ASwzsGgZNOhXlBueSXGIOBmx01BOE_-kYVb_7GQGUWEM9r_8F1olAWVWuA52cr1UOcQfFMIQuWPn0YJB&vault=true&intent=subscription`;
      script.setAttribute('data-sdk-integration-source', 'button-factory');
      script.onload = () => {
        renderPayPalButtons();
      };
      document.body.appendChild(script);
    };

    const renderPayPalButtons = () => {
      const plans = [
        { planId: 'P-1F4068503Y474580CM33INBY', containerId: 'paypal-button-container-P-1F4068503Y474580CM33INBY' },
        { planId: 'P-9DV62307910525736M33IQTI', containerId: 'paypal-button-container-P-9DV62307910525736M33IQTI' },
        { planId: 'P-49H56345ED219340FM33IPXI', containerId: 'paypal-button-container-P-49H56345ED219340FM33IPXI' }
      ];

      plans.forEach(({ planId, containerId }) => {
        (paypal as any).Buttons({
          style: {
            shape: 'rect',
            color: 'gold',
            layout: 'vertical',
            label: 'subscribe'
          },
          createSubscription: function(data: Record<string, unknown>, actions: Record<string, unknown>) {
            return (actions as any).subscription.create({
              plan_id: planId
            });
          },
          onApprove: function(data: Record<string, unknown>) {
            alert(data.subscriptionID); // You can add optional success message for the subscriber here
          }
        }).render(`#${containerId}`);
      });
    };

    if (typeof paypal === 'undefined') {
      loadPayPalScript();
    } else {
      renderPayPalButtons();
    }
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-6xl font-bold text-blue-600 mt-16">Pricing Plans</h1>
        <p className="text-lg text-gray-600 text-center mt-4">Choose a plan that suits your needs. Generating outlines is free, so you can generate outlines as much as you want until they suit you!</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {/* Hobbyist Plan */}
          <div className="bg-gray-300 p-6 rounded-lg shadow-lg text-center border-4 border-blue-500">
            <h3 className="text-2xl font-semibold">Hobbyist</h3>
            <p className="text-xl font-bold">$15/month</p>
            <p className="text-lg">5 generated E-books/month</p>
            <p className="text-gray-600">📖 Generate outlines for free!</p>
            <p className="text-gray-600">OpenAI Model: GPT-4o</p>
            <div id="paypal-button-container-P-1F4068503Y474580CM33INBY"></div>
          </div>

          {/* Pro Plan */}
          <div className="bg-blue-500 text-white p-10 rounded-lg shadow-lg text-center border-4 border-blue-700 transform scale-125">
            <h3 className="text-2xl font-semibold">Pro <span className="bg-yellow-400 text-black rounded-full px-2 text-sm">Most Popular</span></h3>
            <p className="text-xl font-bold">$50/month</p>
            <p className="text-lg">30 generated E-books/month</p>
            <p className="text-gray-200">📖 Generate outlines for free!</p>
            <p className="text-gray-200">OpenAI Model: GPT-4o</p>
            <div id="paypal-button-container-P-9DV62307910525736M33IQTI"></div>
          </div>

          {/* Author Plan */}
          <div className="bg-gray-300 p-6 rounded-lg shadow-lg text-center border-4 border-blue-500">
            <h3 className="text-2xl font-semibold">Author</h3>
            <p className="text-xl font-bold">$25/month</p>
            <p className="text-lg">15 generated E-books/month</p>
            <p className="text-gray-600">📖 Generate outlines for free!</p>
            <p className="text-gray-600">OpenAI Model: GPT-4o</p>
            <div id="paypal-button-container-P-49H56345ED219340FM33IPXI"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;

