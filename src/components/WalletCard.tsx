import React, { useState } from 'react';
import { Copy, QrCode, Wallet, Network } from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WalletCardProps {
  address: string;
}

const networks = [
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', balance: '0.5' },
  { id: 'polygon', name: 'Polygon', symbol: 'MATIC', balance: '100' },
  { id: 'arbitrum', name: 'Arbitrum', symbol: 'ETH', balance: '0.2' },
];

export const WalletCard = ({ address }: WalletCardProps) => {
  const [selectedNetwork, setSelectedNetwork] = useState(networks[0]);

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard!');
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleNetworkChange = (networkId: string) => {
    const network = networks.find(n => n.id === networkId);
    if (network) {
      setSelectedNetwork(network);
      toast.success(`Switched to ${network.name} network`);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md mx-auto space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-wallet-text flex items-center gap-2">
            <Wallet className="w-5 h-5 text-wallet-primary" />
            Your Wallet
          </h2>
          <Dialog>
            <DialogTrigger asChild>
              <button className="p-2 hover:bg-wallet-secondary rounded-full transition-colors">
                <QrCode className="w-5 h-5 text-wallet-primary" />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Wallet QR Code</DialogTitle>
              </DialogHeader>
              <div className="flex items-center justify-center p-6">
                <QRCodeSVG value={address} size={200} />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center justify-between bg-wallet-background rounded-lg p-4">
          <span className="font-mono text-sm">{formatAddress(address)}</span>
          <button
            onClick={copyAddress}
            className="p-2 hover:bg-wallet-secondary rounded-full transition-colors"
          >
            <Copy className="w-4 h-4 text-wallet-primary" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-wallet-primary" />
            <Select
              value={selectedNetwork.id}
              onValueChange={handleNetworkChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select network" />
              </SelectTrigger>
              <SelectContent>
                {networks.map((network) => (
                  <SelectItem key={network.id} value={network.id}>
                    {network.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-wallet-background rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Balance</span>
              <span className="font-semibold">
                {selectedNetwork.balance} {selectedNetwork.symbol}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};