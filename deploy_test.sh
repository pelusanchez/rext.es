npm run create
tar -zcvf dist_photo.tar.gz build/
scp dist_photo.tar.gz peluu@davidiglesias.net:/home/peluu
ssh peluu@davidiglesias.net /home/peluu/deploy_photo.sh
