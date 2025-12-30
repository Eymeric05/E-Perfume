import React from 'react';
import { 
  FaLemon, 
  FaSeedling, 
  FaTree, 
  FaFire, 
  FaWater,
  FaLeaf,
  FaCoffee,
  FaWind
} from 'react-icons/fa';

const FragranceNotes = ({ fragranceNotes }) => {
  if (!fragranceNotes || !Array.isArray(fragranceNotes) || fragranceNotes.length === 0) {
    return null;
  }

  const getNoteIcon = (note) => {
    const noteLower = note.toLowerCase();
    
    if (noteLower.includes('citron') || noteLower.includes('bergamote') || noteLower.includes('pamplemousse') || noteLower.includes('orange')) {
      return <FaLemon className="w-4 h-4" />;
    }
    if (noteLower.includes('fleur') || noteLower.includes('rose') || noteLower.includes('jasmin') || noteLower.includes('orchidée')) {
      return <FaSeedling className="w-4 h-4" />;
    }
    if (noteLower.includes('bois') || noteLower.includes('cèdre') || noteLower.includes('santal') || noteLower.includes('vétiver')) {
      return <FaTree className="w-4 h-4" />;
    }
    if (noteLower.includes('poivre') || noteLower.includes('épice') || noteLower.includes('cannelle') || noteLower.includes('gingembre')) {
      return <FaFire className="w-4 h-4" />;
    }
    if (noteLower.includes('fruit') || noteLower.includes('framboise') || noteLower.includes('poire') || noteLower.includes('pomme')) {
      return <FaLemon className="w-4 h-4" />;
    }
    if (noteLower.includes('vanille') || noteLower.includes('caramel') || noteLower.includes('sucre') || noteLower.includes('praliné')) {
      return <FaSeedling className="w-4 h-4" />;
    }
    if (noteLower.includes('café') || noteLower.includes('cacao') || noteLower.includes('chocolat')) {
      return <FaCoffee className="w-4 h-4" />;
    }
    if (noteLower.includes('aquatique') || noteLower.includes('marine') || noteLower.includes('eau')) {
      return <FaWater className="w-4 h-4" />;
    }
    if (noteLower.includes('menthe') || noteLower.includes('frais')) {
      return <FaWind className="w-4 h-4" />;
    }
    if (noteLower.includes('musc') || noteLower.includes('ambre') || noteLower.includes('patchouli')) {
      return <FaLeaf className="w-4 h-4" />;
    }
    
    return <FaSeedling className="w-4 h-4" />;
  };

  const noteTypeColors = {
    'Top': 'bg-blue-500',
    'Coeur': 'bg-pink-500',
    'Base': 'bg-amber-600',
  };

  const noteTypeLabels = {
    'Top': 'Notes de Tête',
    'Coeur': 'Notes de Cœur',
    'Base': 'Notes de Fond',
  };

  return (
    <div className="py-6 border-t border-b border-luxe-charcoal/10 dark:border-luxe-gold/20">
      <h3 className="font-serif text-xl font-normal text-luxe-black dark:text-luxe-cream mb-6">
        Notes Olfactives
      </h3>
      <div className="space-y-6">
        {fragranceNotes.map((noteGroup, index) => (
          <div key={index} className="space-y-3">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-1 h-8 ${noteTypeColors[noteGroup.type] || 'bg-luxe-gold'} rounded-full`} />
              <p className="font-sans text-sm font-semibold uppercase tracking-wider text-luxe-black dark:text-luxe-cream">
                {noteTypeLabels[noteGroup.type] || noteGroup.type}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {noteGroup.notes && noteGroup.notes.map((note, noteIndex) => (
                <span
                  key={noteIndex}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-luxe-champagne/30 dark:bg-luxe-gold/20 border border-luxe-gold/20 rounded-full text-sm font-sans text-luxe-black dark:text-luxe-cream hover:bg-luxe-gold/20 hover:border-luxe-gold transition-all duration-200 cursor-default"
                >
                  <span className="text-luxe-gold">
                    {getNoteIcon(note)}
                  </span>
                  {note}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FragranceNotes;

