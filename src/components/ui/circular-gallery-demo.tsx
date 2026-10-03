import React from 'react';
import { CircularGallery, GalleryItem } from '@/components/ui/circular-gallery';

const galleryData: GalleryItem[] = [
	{
		common: 'Lion',
		binomial: 'Panthera leo',
		photo: {
			url: 'https://cdn.21st.dev/assets/mirror/ef/ef529e673f5cd10e43948c189473d7f301ebad66d172d891e052db1e3f5cc093.jpg',
			text: 'lion couple kissing on a brown rock',
			pos: '47% 35%',
			by: 'Clément Roy'
		}
	},
	{
		common: 'Asiatic elephant',
		binomial: 'Elephas maximus',
		photo: {
			url: 'https://cdn.21st.dev/assets/mirror/a4/a452d427a19507e4f14d05ca545df406c2304ff3946599b6cfa97dc81c647460.jpg',
			text: 'herd of Sri Lankan elephants walking away from a river',
			pos: '75% 65%',
			by: 'Alex Azabache'
		}
	},
	{
		common: 'Red-tailed black cockatoo',
		binomial: 'Calyptorhynchus banksii',
		photo: {
			url: 'https://cdn.21st.dev/assets/mirror/ec/ecccd101412d0c0e2865c0a80978192fdf05b738b9a057c4ab1a4cfd84d90cdb.jpg',
			text: 'close-up of a black cockatoo',
			pos: '53% 43%',
			by: 'David Clode'
		}
	},
	{
		common: 'Dromedary',
		binomial: 'Camelus dromedarius',
		photo: {
			url: 'https://cdn.21st.dev/assets/mirror/62/62477002d6e425b54d616d138a7b5c862e2bda1dcbd754fee075dbc04fc9d007.jpg',
			text: 'camel and her new born calf walking in the Sahara desert',
			pos: '65% 65%',
			by: 'Moaz Tobok'
		}
	},
	{
		common: 'Polar bear',
		binomial: 'Ursus maritimus',
		photo: {
			url: 'https://cdn.21st.dev/assets/mirror/65/65eee6e9e7c2cd4fbb380d712346532109a5d6da513bd835a4c278424589d805.jpg',
			text: 'polar bear on the snow, by the water, raised on the hind legs, front paws together',
			pos: '50% 25%',
			by: 'Hans-Jurgen Mager'
		}
	},
	{
		common: 'Giant panda',
		binomial: 'Ailuropoda melanoleuca',
		photo: {
			url: 'https://cdn.21st.dev/assets/mirror/d9/d958dcbb75b0cc4cd2d03578c809614f2c85f06e8573558683cc1f1418596753.jpg',
			text: 'giant panda hanging from a tree branch',
			pos: '47%',
			by: 'Jiachen Lin'
		}
	},
	{
		common: 'Grévy\'s zebra',
		binomial: 'Equus grevyi',
		photo: {
			url: 'https://cdn.21st.dev/assets/mirror/91/91d46e30090f4b1b3ff7705e1029d2fc4f6cb824155b6728d92689d7472d0eed.jpg',
			text: 'zebra standing on wheat field, looking back towards the camera',
			pos: '65% 35%',
			by: 'Jeff Griffith'
		}
	},
	{
		common: 'Cheetah',
		binomial: 'Acinonyx jubatus',
		photo: {
			url: 'https://cdn.21st.dev/assets/mirror/00/00c52ec264acae5198946c16870aebab88a2e4b60b504b5aac7e5abe02c4ca63.jpg',
			text: 'cheetah sitting in the grass under a blue sky',
			by: 'Mike Bird'
		}
	},
	{
		common: 'King penguin',
		binomial: 'Aptenodytes patagonicus',
		photo: {
			url: 'https://cdn.21st.dev/assets/mirror/00/00f92b2eb93c967ad77e3c34dbca897ca08e0eb595b00a82e1db281994f12bff.jpg',
			text: 'king penguin with a fluffy brown chick on grey rocks',
			pos: '35%',
			by: 'Martin Wettstein'
		}
	},
	{
		common: 'Red panda',
		binomial: 'Ailurus fulgens',
		photo: {
			url: 'https://cdn.21st.dev/assets/mirror/da/dab2d7dc03c3c605577e6a8782f1bdb2792b9f41530f34c1cc1ce35ae83c29e9.jpg',
			text: 'a red panda in a tree',
			by: 'Niels Baars'
		}
	},
];

const CircularGalleryDemo = () => {
  return (
    // This outer container provides the scrollable height
    <div className="w-full bg-background text-foreground" style={{ height: '500vh' }}>
      {/* This inner container sticks to the top while scrolling */}
      <div className="w-full h-screen sticky top-0 flex flex-col items-center justify-center overflow-hidden">
        <div className="text-center mb-8 absolute top-16 z-10">
          <h1 className="text-4xl font-bold">Animal Gallery</h1>
          <p className="text-muted-foreground">Scroll to rotate the gallery</p>
        </div>
        <div className="w-full h-full">
          <CircularGallery items={galleryData} />
        </div>
      </div>
    </div>
  );
};

export default CircularGalleryDemo;
