import React from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Wallet } from 'lucide-react'

export const WalletConnector = () => {
  const { connected, publicKey } = useWallet()

  return (
    <div className="flex items-center gap-4">
      {connected && publicKey && (
        <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
          <Wallet className="w-4 h-4 text-white" />
          <span className="text-white text-sm font-medium">
            {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
          </span>
        </div>
      )}
      <WalletMultiButton className="!bg-gradient-to-r !from-purple-500 !to-pink-500 !rounded-lg !font-medium !text-white hover:!from-purple-600 hover:!to-pink-600 !transition-all !duration-200" />
    </div>
  )
}